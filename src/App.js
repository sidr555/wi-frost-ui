// import logo from './logo.svg';
import React, {useEffect, useState} from 'react';
import './App.css';
import {
    AppBar, BottomNavigation, BottomNavigationAction,
    Box,
    Button,
    Card, CardActions,
    CardContent,
    CardMedia,
    Container,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Grid,
    IconButton,
    // Menu, MenuItem,
    Paper, TextField,
    Toolbar,
    Typography
} from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
// import LayerIcon from '@material-ui/icons/Layers';
import {makeStyles} from "@material-ui/core/styles";
// import AccountCircle from "@material-ui/icons/AccountCircle";
// import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";
// import FolderIcon from '@material-ui/icons/Folder';
// import RestoreIcon from '@material-ui/icons/Restore';
// import FavoriteIcon from '@material-ui/icons/Favorite';
// import LocationOnIcon from '@material-ui/icons/LocationOn';
// import {Image} from "@material-ui/icons";


import AuthMenu from "./AuthMenu";

import StateItem from "./StateItem";
import StateSectionTitle from "./StateSectionTitle";
import AppMenu from "./AppMenu";
import API from "./Api";


const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1
    },
    menuButton: {
        margingRight: theme.spacing(1)
    },
    title: {
        flexGrow: 1
    },
    mainContent: {
        marginTop: theme.spacing(10)
    },
    mainFeaturesPost: {
        position: "relative",
        color: theme.palette.common.white,
        marginTop: theme.spacing(5),
        marginBottom: theme.spacing(4),
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center"
    },
    mainFeaturesPostContent: {
        position: "relative",
        padding: theme.spacing(6),
        marginTop: theme.spacing(8)
    },
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundOverlay: "rgba(0,0,0,.5)"
    },
    mainButtons: {},
    cardGrid: {
        marginTop: theme.spacing(4)
    },
    card: {},
    cardMedia: {
        paddingTop: "56.25%"
    },
    cardContent: {
        flexGrow: 1
    },
}));

function App() {
    const classes = useStyles();
    const [auth, setAuth] = React.useState(true);
    const [state, setState] = React.useState({
        uptime: 159200,
        task: 'none',
        tasktime: 1243,
        compressor_sleeptime: 16000,
        temperature: {
            moroz: -16.3,
            body: -6.7,
            unit: 27.3,
            room: 22.8,
            compressor: 56.8
        },
    });
    const [config, setConfig] = React.useState({
        brand: "",
        model: "",
        image: "",
        scheme: "",
        instruction: "",
        temp_sensors: {}
    });



    const tasks = {
        none: "Недоступен",
        sleep: "Сон",
        freeze: "Охлаждение",
        heat: "Разморозка",
        danger: "Авария"
    };
    const temp_sensors = {
        moroz: "Морозильная камера",
        body: "Холодильная камера",
        compressor: "Компрессор",
        unit: "Блок управления",
        room: "Помещение"
    };

    const niceTime = (sec) => {
        if (sec < 45) {
            return sec + " сек.";
        } else if (sec < 90) {
            return "1 мин.";
        } else if (sec < 150) {
            return "2 мин.";
        } else if (sec < 3600) {
            return parseInt(sec / 60) + " мин."
        } else if (sec < 2 * 86400) {
            return parseInt(sec / 3600) + " час."
        } else {
            return parseInt(sec / 86400) + " дн."
        }
    };

    const niceTimeDiff = (time) => {
        return time > 0 ? niceTime((new Date()).getTime() / 1000 - time) : "-";
    }

    const changeTask = (task) => {
        setState(prevState => {
            prevState.tasktime = 0;
            prevState.task = task;
            return prevState;
        });
        // state.tasktime = 0;
        // state.task = task;
        // setState(state);
        console.log("changeTask", task, state);
    }

    const getFanState = () => {
        if (state.task === "none") {
            return "-";
        } else if (state.task === "heat" && state.task_time > 0) {
            return "Отключен";
        }
        return "Работает";
    }

    useEffect(() => {
        API.get("/config")
            .then(response => response.json())
            .then(config => {
                setConfig(config)
                console.log("Config loaded", config);
            });
        API.get("/state")
            .then(response => response.json())
            .then(state => {
                setState(state)
                console.log("State loaded", state);
            });
    }, []);
    return (
        <>
            <AppBar position="fixed">
                <Container fixed>
                    <Toolbar>
                        <AppMenu instruction={config.instruction}/>

                        <Typography variant="h5" align="center" className={classes.title}>Wi-Frost</Typography>

                        <AuthMenu auth={auth} onAuthorized={() => setAuth(true)} onLogout={() => setAuth(false)}/>
                    </Toolbar>
                </Container>
            </AppBar>

            <main>
                <div className={classes.mainContent}>
                    <Container maxWidth="md">
                        <Typography
                            variant="h2"
                            align="center"
                            color="textPrimary"
                            gutterBottom
                        >{config.brand} {config.model}</Typography>


                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4} md={4} lg={4} align="right">
                                <img className={classes.img} alt={config.brand + '' + config.model} src={config.image}/>
                            </Grid>
                            <Grid item xs={12} sm={8} md={8} lg={8} container alignContent="space-between">
                                <StateSectionTitle title="Состояние" />
                                <StateItem key="uptime" title="Общее время работы" value={niceTimeDiff(state.start_time)} />

                                <StateItem key="task" title="Текущее состояние" value={tasks[state.task]} />

                                <StateItem key="time" title="В течение" value={niceTimeDiff(state.task_time)} />
                                <StateItem key="fan" title="Вентилятор" value={getFanState()} />

                                <StateSectionTitle title="Температура"/>
                                    {Object.keys(config.temp_sensors).map((key, index) => {
                                        let temp = " ̊ C";
                                        if (state.temperature[key] === null) {
                                            temp = "-";
                                        } else {
                                            temp = state.temperature[key] + temp;
                                            if (state.temperature[key] > 0) {
                                                temp = "+" + temp;
                                            }
                                        }
                                        return <StateItem key={"temp_" + key} title={temp_sensors[key]} value={temp}/>
                                    })}

                                    {auth && state.task !== "none" &&
                                    <Grid container>
                                        <StateSectionTitle title="Изменить режим работы"/>

                                        <Grid item xs={12}>
                                            <div className={classes.mainButtons}>
                                                <Grid container spacing={5} justify="center">
                                                    {state.task === "freeze" ||
                                                    state.compressor_sleeptime < config.compressor_sleeptime ||
                                                    <Grid item>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => {
                                                                changeTask("freeze")
                                                            }}
                                                        >Охлаждение</Button>
                                                    </Grid>
                                                    }
                                                    {state.task === "heat" ||
                                                    <Grid item>
                                                        <Button
                                                            variant="contained"
                                                            color="secondary"
                                                            onClick={() => {
                                                                changeTask("heat")
                                                            }}
                                                        >Разморозка</Button>
                                                    </Grid>
                                                    }
                                                    {state.task === "sleep" ||
                                                    <Grid item>
                                                        <Button
                                                            variant="outlined"
                                                            color="secondary"
                                                            onClick={() => {
                                                                changeTask("sleep")
                                                            }}
                                                        >Отдых</Button>
                                                    </Grid>
                                                    }
                                                </Grid>
                                            </div>
                                        </Grid>
                                    </Grid>
                                    }
                            </Grid>
                        </Grid>

                    </Container>
                </div>
            </main>
        </>
    );
}

export default App;