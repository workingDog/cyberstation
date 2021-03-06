/* eslint-disable flowtype/require-valid-file-annotation */


// @flow weak
import Grid from 'material-ui/Grid';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Divider from 'material-ui/Divider';
import {FormControlLabel} from 'material-ui/Form';
import Radio, {RadioGroup} from 'material-ui/Radio';
import Table, {TableBody, TableCell, TableRow} from 'material-ui/Table';



const styles = {};

/**
 * used by ServersPage to display the selected server info (discovery) and the api roots url.
 */
export class ServerInfoPanel extends Component {

    constructor(props) {
        super(props);
        this.state = {currentApiroot: '', discovery: '', updateFunc: props.update }
    };

    initialise(theProps){
        if(theProps.server) {
            theProps.server.discovery().then(discovery => {
                this.setState({discovery: discovery, currentApiroot: discovery.default, updateFunc: theProps.update});
                // tell the parent component
             //   this.state.updateFunc(discovery.default);
             //   this.props.update(discovery.default);
            });
        }
    };

    componentDidMount() {
       this.initialise(this.props)
    };

    // when a new props is received
    componentWillReceiveProps(newProps) {
       this.initialise(newProps)
    };

    // change the selected api root
    handleSelection = event => {
    event.persist();
    let theValue = event.target.value;
    if(theValue) {
        this.setState({currentApiroot: theValue.trim()});
        // tell the parent component
        this.state.updateFunc(theValue.trim());
    //    this.props.update(theValue.trim());
        }
    };

    // the api roots url as form labels with a radio button for selection
     apiRootsAsFormLabels() {
         if (this.state.discovery) {
             return this.state.discovery.api_roots.map(obj =>
               <FormControlLabel
                style={{margin: 8}}
                key={obj}
                value={obj}
                control={<Radio/>}
                label={obj}/>);
         }
          else {
             return [];
          }
        };

    serverInfo() {
        if (this.state.discovery) {
            return <Table>
            <TableBody>
                <TableRow key="Title">
                    <TableCell>Title</TableCell>
                    <TableCell>{this.state.discovery.title}</TableCell>
                </TableRow>
                <TableRow key="Description">
                    <TableCell>Description</TableCell>
                    <TableCell style={{whiteSpace: "normal", wordWrap: "break-word"}}>
                        {this.state.discovery.description}
                    </TableCell>
                </TableRow>
                <TableRow key="Contact">
                    <TableCell>Contact</TableCell>
                    <TableCell>{this.state.discovery.contact}</TableCell>
                </TableRow>
                <TableRow key="Default">
                    <TableCell>Default</TableCell>
                    <TableCell>{this.state.discovery.default}</TableCell>
                </TableRow>
            </TableBody>
            </Table>;
        }
    };

    render() {
        return (
            <Grid item xs={12} sm={12}>
                {this.serverInfo()}
                <Divider/>
                <RadioGroup style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between'}}
                            aria-label="apiroots"
                            name="apiroots"
                            value={this.state.currentApiroot}
                          //  onChange={this.handleSelection}>
                            onClick={this.handleSelection}>
                    {this.apiRootsAsFormLabels()}
                </RadioGroup>
            </Grid>
        );
    };

}

ServerInfoPanel.propTypes = {
    server: PropTypes.object,
    update: PropTypes.func.isRequired
};
