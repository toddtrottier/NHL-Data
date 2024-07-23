import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const logoAPI = "https://records.nhl.com/site/api/franchise?include=teams.id&include=teams.active&include=teams.triCode&include=teams.placeName&include=teams.commonName&include=teams.fullName&include=teams.logos&include=teams.conference.name&include=teams.division.name&include=teams.franchiseTeam.firstSeason.id&include=teams.franchiseTeam.lastSeason.id&include=teams.franchiseTeam.teamCommonName";
const activeTeams = [
    "ANA", "BOS", "BUF", "CAR", "CBJ", "CGY", "CHI", "COL", "DAL", "DET", "EDM", "FLA", "LAK", "MIN",
    "MTL", "NJD", "NSH", "NYI", "NYR", "OTT", "PHI", "PIT", "SEA", "SJS", "STL", "TBL", "TOR", "UTA", "VAN", "VGK", 
    "WPG", "WSH"
];

var updatedTeamArray = [];

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
                updatedTeamArray.push({team: teamAbv, url: teamLogoURL});
            }
        }
        console.log("Logos have been populated");
        res.render("index.ejs", {abvAndLogo: updatedTeamArray});
    } catch (e){
        console.error("Failed to retrive team logos: ", e.message);
        res.render("index.ejs");
    }
})

app.listen(port, () => {
    console.log('Server listening on ' + port);
});
