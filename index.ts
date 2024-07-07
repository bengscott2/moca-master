import { chromium, Page, Browser } from "playwright";
import { IncomingWebhook } from "@slack/webhook";
import * as dotenv from "dotenv";

dotenv.config();

async function run() {
  const browser: Browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page: Page = await context.newPage();

  await page.goto("https://www.moccamaster.eu/kbg-select-refurbished");
  await page.click("text=Allow all cookies");

  await page.waitForSelector(".swatch-option");
  const swatchOptions = await page.$$(".swatch-option");

  const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL || "");

  for (let swatchOption of swatchOptions) {
    const label = await page.evaluate(
      (el) => el.getAttribute("data-option-label"),
      swatchOption
    );
    await swatchOption.click();
    await page.waitForTimeout(4000);
    const isSubscribeButtonVisible = await page
      .getByRole("button", {
        name: "Subscribe",
      })
      .isVisible();

    if (isSubscribeButtonVisible) {
      const currentUrl = page.url();

      const message = {
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `${label} is available`,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Quick! The Moccamaster is available!",
            },
            accessory: {
              type: "button",
              text: {
                type: "plain_text",
                text: "Go to the Moccamaster website",
              },
              url: currentUrl,
            },
          },
        ],
      };

      webhook
        .send(message)
        .then((res) => {
          console.log("Message sent: ", res.text);
        })
        .catch((e) => {
          console.error("Error sending message: ", e);
        });
    }
  }
  await browser.close();
}

run();
