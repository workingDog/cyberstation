
/* eslint-disable flowtype/require-valid-file-annotation */
/* eslint-disable react/no-multi-comp */
import { viewStyle } from '../styles/viewStyle.js';
import { TaxiiConnect, Server } from '../libs/taxii2lib.js';
import Tabs, { Tab } from 'material-ui/Tabs';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withRoot from '../components/withRoot';
import withStyles from 'material-ui/styles/withStyles';
import { IndicatorPage } from '../stix/indicator.js';
import { BundlePage } from '../stix/bundle.js';
import { RelationsPage } from '../stix/relations.js';
import uuidv4 from 'uuid/v4';



function TabContainer(props) {
  return <div style={{ padding: 6 }}>{props.children}</div>;
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired
};

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit * 30,
    backgroundColor: theme.palette.background.paper
  },
  appBar: {
    position: 'fixed',
    marginTop: 50,
    width: '100%',
    marginLeft: 1,
    order: 1
  }
});

export class StixView extends Component {

  constructor(props) {
    super(props);
    this.server = new Server("/taxii/", this.props.conn);
    this.state = {
      value: 0,
      bundle: { type: "bundle", id: "bundle--" + uuidv4(), spec_version: "2.0", objects: [] }
    };
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    return (
      <div>

        <div style={viewStyle.tabs} >
          <Tabs
            value={this.state.value}
            onChange={this.handleChange}
            indicatorColor="orchid"
            textColor="accent"
            fullWidth
            scrollable
            scrollButtons="auto">
            <Tab label="Bundle" />
            <Tab label="Relations" />
            <Tab label="Indicator" />
            <Tab label="Malware" />
            <Tab label="Attack Pattern" />
            <Tab label="Campaign" />
            <Tab label="Course of Action" />
            <Tab label="Identity" />
            <Tab label="Intrusion Set" />
            <Tab label="Observed Data" />
            <Tab label="Report" />
            <Tab label="Threat Actor" />
            <Tab label="Tool" />
            <Tab label="Vulnerability" />
          </Tabs>
        </div>

        <div style={viewStyle.content} >
          {this.state.value === 0 && <TabContainer> <BundlePage server={this.server} bundle={this.state.bundle} /></TabContainer>}
          {this.state.value === 1 && <TabContainer> <RelationsPage server={this.server} bundle={this.state.bundle} /> </TabContainer>}
          {this.state.value === 2 && <TabContainer> <IndicatorPage server={this.server} bundle={this.state.bundle} /> </TabContainer>}
          {this.state.value === 3 && <TabContainer>{'Malware'}</TabContainer>}
          {this.state.value === 4 && <TabContainer>{'Attack Pattern'}</TabContainer>}
          {this.state.value === 5 && <TabContainer>{'Campaign'}</TabContainer>}
          {this.state.value === 6 && <TabContainer>{'Course of Action'}</TabContainer>}
          {this.state.value === 7 && <TabContainer>{'Identity'}</TabContainer>}
          {this.state.value === 8 && <TabContainer>{'Intrusion Set'}</TabContainer>}
          {this.state.value === 9 && <TabContainer>{'Observed Data'}</TabContainer>}
          {this.state.value === 10 && <TabContainer>{'Report'}</TabContainer>}
          {this.state.value === 11 && <TabContainer>{'Threat Actor'}</TabContainer>}
          {this.state.value === 12 && <TabContainer>{'Tool'}</TabContainer>}
          {this.state.value === 13 && <TabContainer>{'Vulnerability'}</TabContainer>}
        </div>

      </div>
    );
  };

};

StixView.propTypes = {
  conn: PropTypes.object.isRequired
};

export default withStyles(styles)(StixView);
//export default withRoot(withStyles(styles)(TabsView));
