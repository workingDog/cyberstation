/* eslint-disable flowtype/require-valid-file-annotation */


// @flow weak
import Grid from 'material-ui/Grid';
import React, {Component} from 'react';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Table, {TableBody, TableCell, TableRow} from 'material-ui/Table';
import uuidv4 from "uuid/v4";
import AddPanel from '../components/addPanel.js';
import {FormControl} from 'material-ui/Form';
import PropTypes from "prop-types";
import {newDefaultBundle, sleep} from './stixutil.js';
import Divider from 'material-ui/Divider';
import {Collection} from "../libs/taxii2lib";
import Button from 'material-ui/Button';
import Cached from 'material-ui-icons/Cached';



const styles = {};

/**
 * A bundle is the container for stix objects.
 * This is what can be sent to the TAXII-2 server.
 *
 * Create and update bundles of stix objects.
 * Control add/delete and send bundles to the server,
 * display the bundle info and its stix objects list
 */
export class BundlePage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            waiting: false,             // for the progress spinner
            server: this.props.server,  // the current server object
            bundle: this.props.bundle,  // the current bundle object
            collection: '',             // the selected collection endpoint
            apiroot: '',                // the selected apiroot
            bundleList: [],             // the list of bundles obtained from the store
            bundleNameList: [],         // the list of bundles names for use in the AddPanel
            info: ''                    // the server discovery info to display
        };
    }

    initialise(theProps) {
        // make a copy of the bundle list
        let bndlList = JSON.parse(localStorage.getItem('bundleList')) || [];
        this.setState({
            server: theProps.server,
            collection: JSON.parse(localStorage.getItem('collectionSelected')),
            apiroot: localStorage.getItem('serverApiroot') || '',
            bundleList: bndlList,
            bundle: theProps.bundle,
            bundleNameList: bndlList.map(bndl => bndl.name)
        });
        this.showServerInfo();
    };

    // initialise the state
    componentDidMount() {
        this.initialise(this.props)
    };

    // when a new props is received
    componentWillReceiveProps(newProps) {
        this.initialise(newProps)
    };

    objectsAsFormLabels() {
        const objslist = this.state.bundle ? this.state.bundle.objects : [];
        return objslist.map(sdo =>
            <Typography type="body1" key={sdo.id} style={{margin: 8, marginLeft: 16}}>{sdo.name}</Typography>);
    };

    // changes to bundle due to user input editing
    handleChange = name => event => {
    let prevBundleId = this.state.bundle.id;
        switch (name) {
            case "id":
                this.state.bundle.id = event.target.value;
                break;
            case "spec_version":
                this.state.bundle.spec_version = event.target.value;
                break;
            case "name":
                this.state.bundle.name = event.target.value;
                // get the index of the selected bundle in the list
                let ndx = localStorage.getItem('bundleSelected');
                // update the name of this bundle in the list
                this.state.bundleNameList[ndx] = event.target.value;
        }
        let index = this.state.bundleList.findIndex(bndl => bndl.id === prevBundleId);
        if (index !== -1) {
            this.state.bundleList[index] = JSON.parse(JSON.stringify(this.state.bundle));
             localStorage.setItem('bundleList', JSON.stringify(this.state.bundleList));
        }
        this.forceUpdate();
    };

    // callback for the AddPanel (add/delete/select), either a bundle selection or the list of bundle names
    handleBundleUpdate = (event) => {
    // if want to delete the bundle
    if(event.target.delete) {
       // if there is nothing in the list, we have deleted the last bundle, clear everything and return
                    if (this.state.bundleNameList.length <= 0) {
                        localStorage.setItem('bundleSelected', '');
                        localStorage.setItem('bundleList', JSON.stringify([]));
                        this.state.bundleList = [];
                        this.state.bundleNameList = [];
                        this.state.info = '';
                        this.state.bundle = undefined;
                        this.forceUpdate();
                        // tell the parent about having no bundle selected
                        this.props.update(undefined);
                        return;
                    }
    // temp array to store the bundles named in the updated bundleNameList
    let tempArr = [];
    for (let s of this.state.bundleNameList) {
        let ndx = this.state.bundleList.findIndex(bndl => bndl.name === s);
        if(ndx >= 0) {
            tempArr.push(this.state.bundleList[ndx]);
        }
    }
    // update the state list of bundles
    this.state.bundleList = tempArr;
    // select the first bundle of the list
    this.state.bundle = this.state.bundleList[0];
    this.forceUpdate();
    // update the store selected bundle index
     localStorage.setItem('bundleSelected', 0);
     // store the new bundle list as a json string object
     localStorage.setItem('bundleList', JSON.stringify(this.state.bundleList));
     // tell the parent about the selected bundle
     this.props.update(this.state.bundle);
    } else {
        // add or select the bundle
        // event.target.value can be a string or an array of strings (the list)
        if (event.target.value) {
            if (Array.isArray(event.target.value)) {
                // if have an array of names, pick the last value of the array
                let lastValue = event.target.value[event.target.value.length - 1];
                // find the index of the lastValue bundle name in the bundle list
                let ndx = this.state.bundleList.findIndex(bndl => bndl.name === lastValue);
                // if could not find the selection in the bundleList, means we must add a new bundle
                if (ndx === -1) {
                    // create a new bundle
                    let newBundle = JSON.parse(JSON.stringify(newDefaultBundle())); // make a deep copy
                    newBundle.name = lastValue;
                    this.state.bundleList.push(newBundle)
                    this.state.bundleNameList.push(newBundle.name)
                    this.state.info = '';
                    this.state.bundle = newBundle;
                    // the index of the last bundle
                    let lastNdx = this.state.bundleList.length - 1
                    // update the store selected bundle index
                    localStorage.setItem('bundleSelected', lastNdx);
                    // store the new bundle list as a json string object
                    localStorage.setItem('bundleList', JSON.stringify(this.state.bundleList));
                    // tell the parent about the new bundle
                    this.props.update(newBundle);
                } else {
                    // we already have the bundle in the list, just select it
                    // update the store selected bundle index
                    localStorage.setItem('bundleSelected', ndx);
                    let bndlList = JSON.parse(localStorage.getItem('bundleList'));
                    // tell the parent about the selected bundle
                    this.props.update(bndlList[ndx]);
                }
                this.forceUpdate();
        } else {
            // a single selection, just select the bundle
            // find the index of the selected named bundle in the list
            let theIndex = this.state.bundleList.findIndex(bndl => bndl.name === event.target.value);
             if (theIndex >= 0) {
                // update the store selected bundle
                localStorage.setItem('bundleSelected', theIndex);
                // tell the parent about the selected bundle
                this.props.update(this.state.bundleList[theIndex]);
            }
        }
      }
      }
    };

    showServerInfo() {
        if (this.state.server) {
            this.state.server.discovery().then(discovery => {
                let colEntry = 'no collection selected';
                let writeVal = '';
                let colInfo = 'Collection';
                if (this.state.collection) {
                    writeVal = this.state.collection.can_write ? 'can write to' : 'cannot write to';
                    colInfo = "Collection (" + writeVal + ")";
                    colEntry = this.state.collection.title;
                }
                let serverInfo = <Table style={{marginLeft: 8}}>
                    <TableBody>
                        <TableRow key="Title">
                            <TableCell>Title</TableCell>
                            <TableCell>{discovery.title}</TableCell>
                        </TableRow>
                        <TableRow key="Description">
                            <TableCell>Description</TableCell>
                            <TableCell style={{whiteSpace: "normal", wordWrap: "break-word"}}>
                                {discovery.description}
                            </TableCell>
                        </TableRow>
                        <TableRow key="Contact">
                            <TableCell>Contact</TableCell>
                            <TableCell>{discovery.contact}</TableCell>
                        </TableRow>
                        <TableRow key="Endpoint">
                            <TableCell>{colInfo}</TableCell>
                            <TableCell>{colEntry}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>;
                this.setState({info: serverInfo});
            })
        } else {
            this.setState({info: "no server"});
        }
    };

    showBundleInfo() {
        if (this.state.bundle) {
            return <form noValidate autoComplete="off">
                <Grid key="bundle1" item>
                    <TextField style={{marginLeft: 8, width: 350}}
                               name="name"
                               id="name"
                               label="name"
                               value={this.state.bundle.name}
                               margin="normal"
                               onChange={this.handleChange('name')}
                    />
                    <TextField style={{marginLeft: 22, width: 40}}
                               name="spec_version"
                               id="spec_version"
                               label="spec_version"
                               value={this.state.bundle.spec_version}
                               margin="normal"
                               onChange={this.handleChange('spec_version')}
                    />
                </Grid>
                <Grid key="bundle2" item>
                    <TextField style={{marginLeft: 8, width: 400}}
                               name="id"
                               id="id"
                               label="id"
                               value={this.state.bundle.id}
                               margin="normal"
                               onChange={this.handleChange('id')}
                    />
                    <Button variant="fab" dense="true" color="primary" aria-label="redo" style={{width: 33, height: 22}}
                            onClick={(e) => {
                                this.handleChange('id')({target: {value: "bundle--" + uuidv4()}})
                            }}>
                        <Cached/>
                    </Button>
                </Grid>
            </form>
        } else {
            return <div> no bundle information </div>
        }
    };

    // send the bundle to the server collection endpoint
    handleSend = (event) => {
        if (this.state.collection) {
            // add only if can write to the collection
            if (this.state.collection.can_write) {
                this.setState({waiting: true});
                // must remove the name attribute from the bundle object before sending
                // make a deep copy of the bundle
                let bundleCopy = JSON.parse(JSON.stringify(this.state.bundle));
                // remove the name attribute from it, because it's not part of the bundle specs
                delete bundleCopy.name;
                // make a collection object to send the bundle to
                const theCollection = new Collection(this.state.collection, this.state.apiroot, this.props.server.conn);
                // todo timeout, display status and catch error
                theCollection.addObject(bundleCopy).then(status => {
                    console.log("----> collection.addObject() \n" + JSON.stringify(status));
                    this.setState({waiting: false});
                }).catch(err => {
                    this.setState({waiting: false});
                    new Error('add bundle error')
                });
            }
        }
    };

    render() {
        const sendable = this.state.collection ? this.state.collection.can_write : false;
        const bundleName = this.state.bundle ? this.state.bundle.name : '';
        return (
            <Grid container spacing={8}>

                <Grid item xs={5}>
                    <FormControl component="fieldset" required>
                        <Button disabled={!sendable} onClick={this.handleSend} variant="raised" color="primary"
                                style={{margin: 8}}>Send to server</Button>

                        <AddPanel title="bundle"
                                  initSelection={bundleName}
                                  itemList={this.state.bundleNameList}
                                  update={this.handleBundleUpdate}
                                  updateFlag={true} />
                    </FormControl>
                </Grid>

                <Grid item xs={6}>

                    <Grid>
                        {this.showBundleInfo()}
                    </Grid>

                    <Grid key="bundle3" item>
                        <div style={{height: 20}}/>
                        <Typography type="body1" style={{marginLeft: 8}}>Connected to</Typography>
                        {this.state.info}
                    </Grid>

                    <Grid key="bundle4" item>
                        <div style={{height: 20}}/>
                        <Typography type="body1" style={{marginLeft: 8}}>Bundle content</Typography>
                        <Divider/>
                        {this.objectsAsFormLabels()}
                    </Grid>

                </Grid>
            </Grid>
        );
    };

}

BundlePage.propTypes = {
    server: PropTypes.object,
    bundle: PropTypes.object,
    update: PropTypes.func
};
