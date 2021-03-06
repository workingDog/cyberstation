import React from 'react';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';
import Input, {InputLabel} from 'material-ui/Input';
import {FormControl} from 'material-ui/Form';
import Select from 'material-ui/Select';
import {MenuItem} from 'material-ui/Menu';
import Switch from 'material-ui/Switch';
import {FormControlLabel} from 'material-ui/Form';
import moment from 'moment';
import Button from 'material-ui/Button';
import Cached from 'material-ui-icons/Cached';
import {labelsNames} from '../stix/stixutil.js';
import AddPanel from '../components/addPanel.js';
import Tooltip from 'material-ui/Tooltip';


export const ITEM_HEIGHT = 48;
export const ITEM_PADDING_TOP = 12;

/**
 * common attribute of all sdo:
 * name, created, modify, revoked, confidence, lang, labels, created_by_ref,
 * object_marking_refs, external_references
 *
 * todo granular_markings
 */
export const commonStix = (stix, handler) => {
    return (
        <Grid>
            <form noValidate autoComplete="off">
                <Grid key="a0" item>
                    <TextField style={{marginLeft: 8}}
                               name="name"
                               type="text"
                               id="name"
                               label="name"
                               value={stix.name}
                               margin="normal"
                               onChange={handler('name')}
                               fullWidth
                    />
                </Grid>

                <Grid key="a1" item>
                    <TextField style={{marginLeft: 8, width: 210}}
                               type="text"
                               name="created"
                               id="created"
                               label="created"
                               value={stix.created}
                               margin="normal"
                               onChange={handler('created')}
                    />
                    <Tooltip id="tooltip-add" title="Renew the timestamp" placement="top" enterDelay={500}>
                        <Button variant="fab" dense="true" color="primary" aria-label="redo" style={{width: 33, height: 22}}
                                onClick={(e) => {
                                    handler('created')({target: {value: moment().toISOString()}})
                                }}>
                            <Cached/>
                        </Button>
                    </Tooltip>
                    <TextField style={{marginLeft: 26, width: 210}}
                               type="text"
                               name="modified"
                               id="modified"
                               label="modified"
                               value={stix.modified}
                               margin="normal"
                               onChange={handler('modified')}
                    />
                    <Tooltip id="tooltip-add" title="Renew the timestamp" placement="top" enterDelay={500}>
                        <Button variant="fab" dense="true" color="primary" aria-label="redo" style={{width: 33, height: 22}}
                                onClick={(e) => {
                                    handler('modified')({target: {value: moment().toISOString()}})
                                }}>
                            <Cached/>
                        </Button>
                    </Tooltip>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={stix.revoked}
                                onChange={handler('revoked')}
                                aria-label="revoked"
                            />
                        }
                        label="revoked"
                        style={{padding: 22}}
                    />
                </Grid>

                <Grid key="a2" item>
                    <TextField style={{marginLeft: 8, width: 50}}
                               type="number"
                               name="confidence"
                               id="confidence"
                               label="conf"
                               value={stix.confidence}
                               margin="normal"
                               onChange={handler('confidence')}
                               InputLabelProps={{shrink: true}}
                    />
                    <TextField style={{marginLeft: 20, width: 100}}
                               type="text"
                               name="lang"
                               id="lang"
                               label="lang"
                               value={stix.lang}
                               margin="normal"
                               onChange={handler('lang')}
                    />

                    <FormControl style={{marginLeft: 8, top: 3}}>
                        <InputLabel htmlFor="labels-multiple">Labels</InputLabel>
                        <Select
                            style={{width: 550}}
                            multiple
                            value={stix.labels}
                            onChange={handler('labels')}
                            input={<Input id="labels-multiple"/>}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                                        width: 200,
                                    },
                                },
                            }}
                        >
                            {labelsNames.map(name => (
                                <MenuItem key={name} value={name} style={{fontWeight: '500'}}>
                                    {name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                </Grid>

                <Grid key="a4" item>
                    <TextField style={{marginLeft: 8}}
                               type="text"
                               name="created_by_ref"
                               id="created_by_ref"
                               label="created_by_ref"
                               value={stix.created_by_ref}
                               margin="normal"
                               onChange={handler('created_by_ref')}
                               fullWidth
                    />
                </Grid>

                <Grid key="b4" container>
                    <Grid key="a11" item md={6} >
                        <AddPanel title="Object marking refs" itemList={stix.object_marking_refs}
                                  update={handler('object_marking_refs')}
                        />
                    </Grid>

                    <Grid key="a12" item md={6} >
                        <AddPanel title="External references" itemList={stix.external_references}
                                  update={handler('external_references')}
                        />
                    </Grid>
                </Grid>


            </form>
        </Grid>
    );
};

