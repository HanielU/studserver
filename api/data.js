const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");

// gets all members
router.get("/", (req, res) => res.send("Hello"));

router.post("/", getDashboardData);

async function getDashboardData(req, res) {
	if (!req.body.id || !req.body.password) {
		return res
			.status(400)
			.json({ msg: "Please include a id and password" });
	}
	const launchSettings = {
		defaultViewport: {
			width: 1440,
			height: 900,
		},
	};
	const browser = await puppeteer.launch(launchSettings);
	const page = await browser.newPage();

	// navigates to school portal website
	let url = "https://portal.bazeuniversity.edu.ng/student/";
	await page.goto(url);

	// Increases the timeout for the waitForNavigation function, to avoid errors
	page.setDefaultNavigationTimeout(300000);

	// waits for the username input field to load before proceeding
	await page.waitForSelector("input[name=Username]");

	// Puts my Baze Id in the required input field
	await page.$eval(
		"input[name=Username]",
		(el, id) => (el.value = id),
		req.body.id
	);

	// Puts my password in the required input field
	await page.$eval(
		"input[name=Password]",
		(el, password) => (el.value = password),
		req.body.password
	);

	// Clicks on the submit button
	await page.click("button[class='btn  pull-right btn-primary btn-block']");

	// Waits for the new page to load before process
	await page.waitForNavigation({ waitUntil: "load" });

	// Retreives Student Name
	const studName = await page.$eval(
		"#bs-example-navbar-collapse-1 > ul > li > a",
		(el) => el.textContent
	);

	// retrieves student details => studData-First
	const sdFirst = await page.$$eval(
		"#content > div > div.panel-body > div:nth-child(3) > div > table > tbody > tr > th:nth-child(2) > strong",
		(el) => {
			return el.map((el) => el.textContent);
		}
	);

	// retrieves student details => studData-Second
	const sdSecond = await page.$$eval(
		"#content > div > div.panel-body > div:nth-child(3) > div > table > tbody > tr > th:nth-child(4) > strong",
		(el) => {
			return el.map((el) => el.textContent);
		}
	);

	// -> there are two arrays because the selectors for sdFirst don't match that of sdSecond
	// Joins both data from sdFirst & sdSecond
	const studData = sdFirst.concat(sdSecond);

	// retrieves student quick Statistics
	const statData = await page.$$eval(
		"#content > div > div.panel-body > div:nth-child(4) > div:not(:nth-child(1)) > div > div.row > div > span",
		(el) => {
			return el.map((el) => el.textContent);
		}
	);

	const cumulativePtAvg = await page.$eval(
		"#content > div > div.panel-body > div:nth-child(4) > div.col-md-4 > div > strong",
		(el) => el.textContent
	);

	const titles = [
		[
			"Student ID:",
			"Student Names:",
			"Current Program:",
			"Student Satus:",
			"Student Level:",
			"Student Semester:",
		],
		[
			"Registered Modules",
			"Modules Passed",
			"Modules Failed",
			"Currently Taking",
		],
	];

	// json format data of student Details
	const studDetails = [
		{
			title: titles[0][0],
			detail: studData[0],
		},
		{
			title: titles[0][1],
			detail: studData[3],
		},
		{
			title: titles[0][2],
			detail: studData[1],
		},
		{
			title: titles[0][3],
			detail: studData[5],
		},
		{
			title: titles[0][4],
			detail: studData[2],
		},
		{
			title: titles[0][5],
			detail: studData[4],
		},
	];

	const quickStats = statData.map((data, index) => {
		return {
			title: titles[1][index],
			number: data,
		};
	});

	console.log([studName, quickStats, studDetails, cumulativePtAvg]);

	// used to make program wait
	// await page.waitForTimeout(120000);

	res.json([studName, quickStats, studDetails, cumulativePtAvg]);

	await browser.close();
}

module.exports = router;
