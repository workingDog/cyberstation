/* eslint-disable flowtype/require-valid-file-annotation */
/* eslint-disable react/no-multi-comp */
import {CollectionsPage} from '../server/collections.js';
import {ServersPage} from '../server/servers.js';
import {ObjectsPage} from '../server/objects.js';
import Tabs, {Tab} from 'material-ui/Tabs';
import SwipeableViews from 'react-swipeable-views';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {viewStyle} from '../styles/viewStyle.js';



function TabContainer(props) {
    return <div style={{padding: 6}}>{props.children}</div>;
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired
};

const styles = theme => ({
    root: {
        flexGrow: 1,
        marginTop: theme.spacing.unit * 30,
        padding: theme.spacing.unit * 12,
        backgroundColor: theme.palette.background.paper
    },
    tabs: {
        position: 'fixed',
        top: 52,
        zIndex: 1,
        padding: theme.spacing.unit * 12,
        marginTop: theme.spacing.unit * 2
    },
    content: {
        marginTop: 74,
        top: 74
    }
});

/**
 * show the SERVERS and COLLECTIONS tabs
 */
export class ServerView extends Component {

    constructor(props) {
        super(props);
        this.state = {value: 0, server: this.props.server};
    }

    // when a new props is received
    componentWillReceiveProps(newProps) {
        this.setState({server: newProps.server});
    };

    // callback for ServersPage
    updateServer = (server) => {
        this.setState({server: server});
        // tell the parent component
        this.props.update(server);
    };

    handleChange = (event, theValue) => {
        this.setState({value: theValue});
    };

    handleChangeIndex = index => {
        this.setState({value: index});
    };

    render() {
        return (
            <div className={styles.root}>
                <div style={viewStyle.tabs}>
                    <Tabs
                        value={this.state.value}
                        onChange={this.handleChange}
                        indicatorColor="orchid"
                        textColor="inherit"
                        fullWidth>
                        <Tab label="Servers"/>
                        <Tab label="Collections"/>
                        <Tab label="Objects"/>
                    </Tabs>
                </div>

                <SwipeableViews
                    style={viewStyle.content}
                    index={this.state.value}
                    onChangeIndex={this.handleChangeIndex}>
                    <TabContainer> <ServersPage server={this.state.server} update={this.updateServer}/> </TabContainer>
                    <TabContainer> <CollectionsPage server={this.state.server}/> </TabContainer>
                    <TabContainer> <ObjectsPage server={this.state.server}/> </TabContainer>
                </SwipeableViews>
            </div>
        );
    };

}

ServerView.propTypes = {
    update: PropTypes.func.isRequired,
    server: PropTypes.object
};

