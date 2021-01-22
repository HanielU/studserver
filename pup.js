const puppeteer = require("puppeteer");

// Self-invoking function
(async function () {
	try {
		// controls the size of the viewport of the headless browser
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

		// waits for the username input field to load before proceeding
		await page.waitForSelector("input[name=Username]");

		// basic element selector for puppeteer
		// const btn = await page.$("[data-id=stats]");
		// await btn.click();

		// Puts my Baze Id in the required input field
		await page.$eval(
			"input[name=Username]",
			(el) => (el.value = "BU/19C/IT/3944")
		);

		// Puts my password in the required input field
		await page.$eval("input[name=Password]", (el) => (el.value = 26990));

		// Clicks on the submit button
		await page.click(
			"button[class='btn  pull-right btn-primary btn-block']"
		);

		// Increases the timeout for the waitForNavigation function, to avoid errors
		page.setDefaultNavigationTimeout(120000);

		// Waits for the new page to load before process
		await page.waitForNavigation({ waitUntil: "load" });

		// takes a screenshot and saves it to the following folder path
		await page.screenshot({ path: "./screenshots/page1.png" });

		// generates a pdf of the page and save it to the following folder path
		// await page.pdf({ path: "./pdfs/page1.pdf" });

		// closes the browser
		await browser.close();
	} catch (err) {
		console.log(err);
	}
})();
