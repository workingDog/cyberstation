/* eslint-disable flowtype/require-valid-file-annotation */

/* global conn */
// @flow weak
import {StixPage, styles} from '../stix/stixPage.js';
import {TaxiiConnect, Server} from '../libs/taxii2lib.js';
import Grid from 'material-ui/Grid';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import withRoot from '../components/withRoot';
import withStyles from 'material-ui/styles/withStyles';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import List, {ListItemText} from 'material-ui/List';
import {FormLabel, FormControl, FormControlLabel} from 'material-ui/Form';
import Radio, {RadioGroup} from 'material-ui/Radio';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Dialog, {DialogActions, DialogContent, DialogContentText, DialogTitle,} from 'material-ui/Dialog';
import Slide from 'material-ui/transitions/Slide';


export class ServersPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,    // for the url dialog
            serverList: [], // the list of servers to choose from
            discovery: '',  // the current server discovery info
            currentSelection: '' // the current selected server url
        }
    };

    componentDidMount() {
        let server = new Server("/taxii/", new TaxiiConnect("https://test.freetaxii.com:8000", "user-me", "user-password"));
        let objItems = [];
        objItems.push(server);
        server.discovery().then(discovery => {
            this.setState({discovery: discovery, serverList: objItems, currentSelection: server.conn.baseURL});
        });
        let event = {target: {value: server.conn.baseURL}};
        this.handleSelected(event);
    };

    serverListAsFormLabels() {
        let formItems = [];
        this.state.serverList.map(serv =>
            formItems.push(<FormControlLabel style={{margin: 8}} key={serv.conn.baseURL} value={serv.conn.baseURL}
                                             control={<Radio/>} label={serv.conn.baseURL}/>));
        return formItems;
    };

    listOfApiRoots(arr) {
        let items = [];
        if (arr !== undefined) {
            for (let j = 0; j < arr.length; j++) {
                items.push(<ListItemText key={j} primary={arr[j]}/>);
            }
        }
        return items;
    };

    // change the selected server
    handleSelected = event => {
        let url = event.target.value;
        let sevr = this.state.serverList.find(s => s.conn.baseURL === url);
        if (sevr !== undefined) {
            // tell the parent component
            this.props.update(sevr, false);
            // get the discovery info
            sevr.discovery().then(discovery => {
                this.setState({discovery: discovery, currentSelection: url});
            });
        }
    };

    // delete the selected server
    handleDelete = (event) => {
        // delete the selected server from the list
        let witoutSelected = this.state.serverList.filter(s => s.conn.baseURL !== this.state.currentSelection);
        this.setState({serverList: witoutSelected, discovery: '', currentSelection: ''});
        // tell the parent it has been deleted
        this.props.update(this.state.currentSelection, true);
    };

    serverInfo() {
        if (this.state.discovery !== undefined) {
            return <List>
                <ListItemText key="a1" primary={this.state.discovery.title}/>
                <ListItemText key="a2" primary={this.state.discovery.description}/>
                <ListItemText key="a3" primary={this.state.discovery.contact}/>
                <ListItemText key="a4" primary={this.state.discovery.default}/>
                <List> {this.listOfApiRoots(this.state.discovery.api_roots)} </List>
            </List>;
        }
    };

    // add a new server to the list
    handleAdd = (event) => {
        this.setState({open: true});
    };

    handleRequestDialogCancel = () => {
        this.setState({open: false});
        this.setState({currentSelection: ''});
    };

    handleRequestDialogOk = () => {
        this.setState({open: false});
        // create a server, test it and add it to the list
        // should check the url first
        let newServer = new Server("/taxii/", new TaxiiConnect(this.state.currentSelection, "user-me", "user-password"));
        newServer.discovery().then(discovery => {
            this.setState({
                discovery: discovery,
                serverList: [...this.state.serverList, newServer],
                currentSelection: newServer.conn.baseURL
            });
        });
        let event = {target: {value: newServer.conn.baseURL}};
        this.handleSelected(event);
    };

    // dynamically change the url input text
    handleDialogChange = event => {
        this.setState({currentSelection: event.target.value});
    };

    render() {
        return (
            <div>
                <Grid container spacing={8}>
                    <Grid item xs={6}>
                        <FormControl component="fieldset" required>
                            <Typography type="body1" wrap style={{margin: 8}}> {this.title} </Typography>
                            <Button onClick={this.handleAdd} raised color="default" style={{margin: 8}}>Add new
                                server</Button>
                            <Button onClick={this.handleDelete} raised color="default" style={{margin: 8}}>Delete
                                selected</Button>
                            <Divider/>
                            <RadioGroup style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between'}}
                                        aria-label="obj"
                                        name="objGroup"
                                        value={this.state.currentSelection}
                                        onChange={this.handleSelected}>
                                {this.serverListAsFormLabels()};
                            </RadioGroup>
                        </FormControl>
                    </Grid>

                    <Grid item xs={6}>
                        <Grid item xs={12} sm={6}>
                            {this.serverInfo()}
                        </Grid>
                    </Grid>
                </Grid>

                <Dialog open={this.state.open} transition={Slide} onRequestClose={this.handleRequestDialogClose}>
                    <DialogTitle>{"Enter the server URL"}</DialogTitle>
                    <DialogContent>
                        <TextField style={{marginLeft: 8, width: 300}}
                                   name="serverUrl"
                                   type="text"
                                   id="serverUrl"
                                   label="server url"
                                   value={this.state.currentSelection}
                                   margin="normal"
                                   onChange={this.handleDialogChange}
                                   fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleRequestDialogCancel} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleRequestDialogOk} color="primary">
                            Ok
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    };

};

ServersPage.propTypes = {
    update: PropTypes.func.isRequired
};

export default withRoot(withStyles(styles)(ServersPage));