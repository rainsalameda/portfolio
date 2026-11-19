# Rain Salameda – Portfolio Website

Plain HTML, CSS and JavaScript. No build step, no dependencies.

```
index.html
css/styles.css
js/main.js
images/      hero.jpg + placeholder project images
videos/      put your .mp4 files here
```

## Deploy to GitHub Pages

1. Create a new repository on GitHub (e.g. `rain-portfolio`).
2. Upload everything in this folder (keep the folder structure), or from a terminal:
   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/rain-portfolio.git
   git push -u origin main
   ```
3. In the repo go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and Save.
4. After a minute the site is live at `https://YOUR-USERNAME.github.io/rain-portfolio/`.

## Things to update

- **Social links:** in `index.html`, search for `TODO` and replace the email, LinkedIn and link URLs.
- **Layout (all Projects sections):** each section fills one full screen and shows a row of 1080 × 1350 px (4:5) cards. On desktop about 2 cards are in view; on phones there is one size only: a single full-width 4:5 card at a time, the same size in the rows and in the opened post. Swipe or drag sideways; dots under each row show your position. Export pictures at **1080 × 1350 px** and make video posters the same size.
- **Marketing campaigns:** 20 designs (bookmarks, flyers, listing posts, banners, invitations). Each is a 4:5 card in the swipe row (`images/marketing/NAME-card.jpg`, 1080 × 1350). Tapping a card opens the full, uncropped design (`images/marketing/NAME.jpg`) at its own proportions. To add one, copy a `<li class="slide slide--post">` block in the Marketing campaigns section, set `data-ratio="width / height"` of the full image, and point the two `data-src` paths at your files.
- **Social media & branding:** a swipe list of post covers. Tapping a post opens a viewer with all of its pictures and videos (swipe left and right; the slides join up seamlessly). Each post is one `<li class="slide slide--post">` in `index.html`; its pages are the `<span data-src=...>` lines inside `.post__slides`. Pictures live in `images/social/`. The list now holds 17 posts: the Aurora Oaks, Greenleaf Village and Trinity Row carousels, the seven Growing Up Healthy And Happy carousels, then the four videos.
- **Social videos:** the four Instagram-mockup videos are the last cards in the Social media list (`videos/social-video-1.mp4` … `4.mp4`, converted to H.264 1080 × 1350 so they play in every browser). All four are framed identically so the phone mockup is the same size and position in every card; in the list, the two wide videos (1 and 4) are cropped to a square window around the phone so the cards match, but when tapped they open the full, uncropped wide video (`social-video-1-full.mp4`, `social-video-4-full.mp4`) so the whole slide strip is visible. They autoplay muted in the list and when opened, with a Sound button. Note: HEVC (iPhone/H.265) videos won't play in most desktop browsers, so export as H.264 MP4.
- **Videos inside a post:** add a line like `<span data-type="video" data-src="videos/my-reel.mp4" data-poster="images/social/my-reel-poster.jpg"></span>` inside that post's `.post__slides`. It autoplays (muted) when its page is showing, and a "Sound" button lets visitors turn sound on. The poster image shows until the video loads.
- **AI Generated Product Video:** fifteen square videos (`videos/product/product-01.mp4` … `15.mp4`), the original files with no re-compression. Cards show the whole square on the videos' grey backdrop; tapping opens the video at 1:1. Add more by copying a `<li class="slide slide--post">` block in that section.
- **Branding & Mock ups:** 8 brand boards (Grow by Bee, Bubba's Gift, City Wash, Tenshi, Cronnette Collection, BPLC, Clean & Vibe, Lead Tutorial). Each card shows the top of the board (logo and first mockups); tapping opens the whole board (`images/branding/NAME.jpg`). Add more by copying a `<li class="slide slide--post">` block and setting `data-ratio` to the full image's width / height.
- **Video & Reel Post:** 12 reels (`videos/reels/reel-01.mp4` … `12.mp4`, posters in `images/reels/`). Each square video sits in a 4:5 card on a soft blurred backdrop, loops muted while on screen, and opens in the viewer with a Sound button when tapped. To add one, encode it H.264 (square or 4:5, 768 wide works well, about 1 MB), copy a `<li class="slide slide--post">` block in that section and change the two video paths and the poster path.
- **Curriculum:** a swipe carousel of Heyzine flipbooks in `index.html` (search for `heyzine`). To add one, copy a `<li class="slide slide--book">` block and change the title and the link. Visitors swipe to move between flipbooks, tap "Tap to open" to use one, and press "Done" to go back to swiping.
- **More slides:** copy any `<li class="slide">…</li>` block inside the gallery you want.

## About preventing downloads (please read)

The site includes these deterrents:

- Images are drawn as CSS backgrounds, so there is no `<img>` for "Save image as".
- A transparent layer sits over every image and video, so right-click and long-press hit the layer, not the media.
- Right-click, drag, text selection, Ctrl/Cmd+S and Ctrl/Cmd+U are blocked on the media.
- Videos have no controls, no download button, no picture-in-picture, and play muted when on screen.

**Honest limit:** these stop casual saving only. Anyone who opens browser developer tools, takes a screenshot, or screen-records can still capture what is displayed. This is true of every website. If protection really matters:

1. **Add a watermark** (logo or name) onto the images and videos themselves before uploading. This is the most effective deterrent.
2. **Upload web-size images only** (about 1200 px wide, compressed). Keep your full-resolution originals private.
3. **For videos**, a host such as Cloudflare Stream, Mux or Vimeo (paid plans) serves protected streams instead of a plain .mp4 file URL. GitHub Pages can't do that.
