import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
// import alert from "alert";

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const logoAPI = "https://records.nhl.com/site/api/franchise?include=teams.id&include=teams.active&include=teams.triCode&include=teams.placeName&include=teams.commonName&include=teams.fullName&include=teams.logos&include=teams.conference.name&include=teams.division.name&include=teams.franchiseTeam.firstSeason.id&include=teams.franchiseTeam.lastSeason.id&include=teams.franchiseTeam.teamCommonName";
const scheduleAPI = "https://api-web.nhle.com/v1/club-schedule/";
const activeTeams = [
    "ANA", "BOS", "BUF", "CAR", "CBJ", "CGY", "CHI", "COL", "DAL", "DET", "EDM", "FLA", "LAK", "MIN",
    "MTL", "NJD", "NSH", "NYI", "NYR", "OTT", "PHI", "PIT", "SEA", "SJS", "STL", "TBL", "TOR", "UTA", "VAN", "VGK", 
    "WPG", "WSH"
];

var updatedTeamArray = [];
var chosenTeam;

app.get("/", async (req, res) => {
    try {
        const result = await axios.get(logoAPI);
        updatedTeamArray = [];
        var teamArray = result.data.data;
        for (let i = 0; i < teamArray.length; i++){
            var teamAbv = teamArray[i].teamAbbrev;
            if (activeTeams.includes(teamAbv)){
                //if team is in active teams array, create a new obj for that team with logo Url and add it to updatedTeamArray
                var teamLogos = teamArray[i].teams[0].logos;
                var teamLogoURL = teamLogos[teamLogos.length - 1].secureUrl;
                updatedTeamArray.push({abv: teamAbv, url: teamLogoURL});
            }
        }
        res.render("index.ejs", {abvAndLogo: updatedTeamArray});
    } catch (e){
        console.error("Failed to retrive team logos: ", e.message);
        res.render("index.ejs");
    }
})

app.post("/schedule", async (req, res) => {
    chosenTeam = req.body.choice;
    const date = new Date();
    const year = date.getFullYear();
    var currentMonth = date.getMonth() + 1;
    if (currentMonth < 10 && currentMonth > 6) {
        //the current month is during offseason, so show the first month of the season
        currentMonth = 10;
    }
    console.log("Chosen team and current month and year: " + chosenTeam + ", " + currentMonth + ", " + year);

    try {
        //get games for current month
        const result = await axios.get(scheduleAPI + chosenTeam + "/month/" + year + "-" + currentMonth);
        const games = result.data.games; //returns array of each game for the selected month

        res.render("schedule.ejs", {games: games});
    } catch (error) {
        console.error("Failed to return team schedule: " + error.message);
        res.render("index.ejs");
    }
});

app.post("/month", async (req, res) => {
    var chosenMonth = req.body.month;
    console.log("Chosen Month - " + chosenMonth);
    const date = new Date();
    var year = date.getFullYear();
    const currentMonth = date.getMonth() + 1;


    //checking to see if the current month is after June. If yes, when user selects Jan-June, the year needs to be advanced by 1 year
    if (currentMonth > 6) {
        //its after june meaning we need to add 1 to the year if the chosen month is Jan-June
        if (chosenMonth > 0 && chosenMonth < 7) {
            year = year + 1;
        }
    }
    console.log("Year - " + year);

    //checking to see if the chosen month falls during off season or playoffs
    if (chosenMonth > 6 && chosenMonth < 10) {
        //off season. return october as month
        chosenMonth = 10;
        console.log("chosen month is in the off season. New month value = " + chosenMonth);
    } else if (chosenMonth > 4 && chosenMonth < 7) {
        //its playoffs, check to see if playoff schedule is available yet
        try {
            var result = await axios.get(scheduleAPI + chosenTeam + "/month/" + year + "-" + chosenMonth);
        } catch (error) {
            console.error("Error because playoff schedule has not been released yet: " + error.message);
            const playoffError = "The " + year + " playoff schedule has not been released yet."
            res.render("schedule.ejs", {playoffMessage: playoffError});
        }
    }


    try {
        if (chosenMonth > 0 && chosenMonth < 10){
            //add a 0 before the month in the api request
            var result = await axios.get(scheduleAPI + chosenTeam + "/month/" + year + "-0" + chosenMonth);
        } else {
            var result = await axios.get(scheduleAPI + chosenTeam + "/month/" + year + "-" + chosenMonth);
        }
        const games = result.data.games; //returns array of games for the selected month
        res.render("schedule.ejs", {games: games});
    } catch (error) {
        console.error("Failed to return team schedule: " + error.message);
        res.render("index.ejs");
    }
});





app.listen(port, () => {
    console.log('Server listening on ' + port);
});
