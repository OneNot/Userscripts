# Reddit - Big Card View
## Makes the card view on Reddit bigger and improves ways content is displayed to go along with that.

### Features
- Makes the Reddit main card container bigger
  - Custom CSS width. Set from script options. Default: 75%
- Makes posts taller by image height
  - Custom CSS height. Set from script options. Default: 70vh
- Loads all images in multi-image posts at once and shows as many as can fit side to side in the post container

### Known issues
- Multi-image posts' images are not centered. This looks right when there are more images than can be visible at once, but when width is left over, it looks weird that the images are aligned left.
- It would be better if only the images that can initially fit inside the multi-image posts' containers would be loaded, with additional images getting loaded after clicking through the images.

This is a more feature rich version of a style of the same name, which you can find [here](https://greasyfork.org/en/scripts/425825-reddit-big-card-view) if you'd prefer.
This is still a work in progress.

____

[GitHub direct install](https://github.com/OneNot/Userscripts/raw/refs/heads/main/Reddit%20-%20Big%20Card%20View/index.user.js) | - [Greasyfork Page](https://greasyfork.org/en/scripts/511058-reddit-big-card-view)
