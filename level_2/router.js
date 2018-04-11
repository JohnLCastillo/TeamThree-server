"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const { Risk } = require("../level_1/models");
const { User } = require("../users/models");
const { localStrategy, jwtStrategy } = require("../auth/strategies");
const router = express.Router();
router.use(bodyParser.json());

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate("jwt", { session: false });

//endpoint takes in risk, year, and currentFund
//and updates the User database with a new currentFund,
//initialFund and previousFund
//sends back the User object to the client
router.put("/invest", jwtAuth, (req, res) => {
  //validate the fields in the body
  const requiredFields = [
    "mattress",
    "conservative",
    "moderate",
    "aggressive",
    "google",
    "autoZone",
    "dollarTree",
    "ea",
    "year",
    "currentFund"
  ];

  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    console.log("missing field = ", missingField);
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Missing field",
      location: missingField
    });
  }

let { 
    mattress, 
		conservative, 
		moderate, 
		aggressive, 
		google, 
		autoZone, 
		dollarTree, 
		ea, 
		year, 
		currentFund } = req.body;

	let newCurrentFundAmt = 0;
	let totalFundIncrease = 0;
	let fundsInvested = 0;
	let fund_gain_loss = 0;

	//get the % increase/decrease from the Risk Db. This value
	//is determined by the year and risk level
	return Risk.find({
		x: { $in: [year] }
	})
		.then(riskData => {
			console.log('riskData = ', riskData);
			for (let i= 0; i < riskData.length; i++ ){
				switch (riskData[i].risk){
				case 'Google':
					fundsInvested = currentFund * parseFloat(google)/100;
					break;

				case 'AutoZone':
					fundsInvested = currentFund * parseFloat(autoZone)/100;
					break;

				case 'Electronic Arts':
					fundsInvested = currentFund * parseFloat(ea)/100;
					break;

				case 'Dollar Tree':
					fundsInvested = currentFund * parseFloat(dollarTree)/100;
					break;

				case 'Mattress':
					fundsInvested = currentFund * parseFloat(mattress)/100;
					break;

				case 'Aggressive':
					fundsInvested = currentFund * parseFloat(aggressive)/100;
					break;

				case 'Moderate':
					fundsInvested = currentFund * parseFloat(moderate)/100;
					break;

				case 'Conservative':
					fundsInvested = currentFund * parseFloat(conservative)/100;
					break;

				default:
					break;
				}
				fund_gain_loss = fund_gain_loss + (fundsInvested + (Math.floor(riskData[i].gain / 100 * fundsInvested))); 
			}

			totalFundIncrease = fund_gain_loss-currentFund;
			newCurrentFundAmt = Math.round(totalFundIncrease + currentFund);

			let growth = Math.round(((newCurrentFundAmt - currentFund)/currentFund) * 100 *100)/100;

			return User.findByIdAndUpdate(
				req.user.id,
				{
					$set: {
						currentFund: newCurrentFundAmt,
						previousFund: currentFund,
						year: year
					},
					$push: {
						risk: {
							x: year,
							y: newCurrentFundAmt,
							strategy: null,
							previousYear: currentFund,
							growth: growth
						}
					}
				},
				{ new: true }
			)
				.then(data => {
					return res.status(200).json(data);
				})
				.catch(err => {
					return res.status(500).json(err);
				});
		})
		.catch(err => {
			return res.status(500).json(err);
		});
});

router.get("/:userid/:strat", (req, res) => {
  let id = req.params.userid;
	if (req.params.userid === 'self'){
	  id = req.user.id;
	}
  User.findById(id)
    .then(data => {
	  Risk
	  .find({ risk: { $in: [req.params.strat] } }).then(values => {
		console.log(values);
		const yr5 = data.year5Amt
        const mappedArr = values.map(obj => {
		//   console.log("mappedobj", obj);
		//   use data.year5amt to get y's of every strat
		  obj.amtChange = Math.floor(obj.gain/100 * yr5);
		  obj.y = yr5 + obj.amtChange;
		  yr5 = obj.y;
		});
		//new arr....do I need to start x at 0? or 5? do I need this at all?
        const newArr = [{ x: 0, y: data.year5Amt }, ...mappedArr];
        console.log("risk values = ", mappedArr);
        return res.json(newArr);
      });
    })
    .catch(err =>
      res.status(500).json(err, { message: "Internal server error" })
    );
});

router.get('/:id', (req, res) => {
	let id = req.params.id;
	if (req.params.id === 'self'){
	  id = req.user.id;
	//   console.log(req.user);
	}
	return User.findById(id)
		.then(user => {
			res.json(user);
		})
		.catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = { router };
