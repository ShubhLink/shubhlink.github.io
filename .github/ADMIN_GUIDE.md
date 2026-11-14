# ShubhLink — Owner-only Admin Panel

This website is public, but content management is protected by GitHub authentication and a workflow rule that allows **only the GitHub username Divyesh1202** to run the update job. Other visitors cannot edit website content through this workflow. This admin feature does not place a password or API token in public HTML.

## Open Admin

Open: https://github.com/ShubhLink/shubhlink.github.io/actions/workflows/shubhlink-admin.yml

Sign into GitHub using `Divyesh1202`, select **Run workflow**, choose **main**, and fill the form.

## Admin operations

- **add-message:** enter existing Category ID, Language (gu/hi/en), and Message. Click **Run workflow**. New message will be added to that category's language.
- **edit-message:** enter Category ID, Language, **message_number** (count starting at 1), and replacement Message. The list order is the order of messages shown on the Wishes page.
- **delete-message:** enter Category ID, Language, and the message number to remove. This is permanent in the latest published content but recoverable from GitHub commit history.
- **add-category:** enter new ID (lowercase letters/numbers/hyphens), Gujarati name, Hindi name, English name, Emoji, and Gujarati description. Language can stay gu. New category starts with no messages. Add some afterward in each language.
- **edit-category:** enter existing Category ID and whichever name/emoji/description fields need changes.

Current Category IDs: `birthday`, `morning`, `suvichar`, `newthought`, `night`, `festival`, `friendship`, `anniversary`, `congrats`, `afternoon`.

## Publishing

After running, open the new workflow run under Actions.
- Green check = the content has been committed to `data.js`.
- Red X = no change was published; review the action's error log.
- The website rebuilds through GitHub Pages. Reload after deployment to see updates.

## Security

- You must log into GitHub with owner username `Divyesh1202`.
- Never share your GitHub password, recovery codes or personal access tokens.
- Do not give other accounts Organization **write** access unless you want them to be able to modify the public website or workflow.
- The GitHub repository itself is public; do not store private customer data or secrets in the content.
- This is an owner-only GitHub Actions content console, **not** a password-protected private dashboard hosted at a public ShubhLink URL.
