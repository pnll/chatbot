# mt-face-api

Detect face, find similar,... using [Microsoft Cognitive Services](https://www.microsoft.com/cognitive-services/en-us/face-api)

## Features

 - uses [request](https://www.npmjs.com/package/request)
 - simple api

## Install

`npm install --save mt-face-api`

## Usage

```
const faceAPI = require('mt-face-api');

var photo = new faceAPI("YOUR SECRET KEY");

/***
 * Ex: Detect face in this photo: http://luonggiaviet.com/Image/Editor/Img/DanhGia/Phim/Ngoc%20Ha/You%20are%20the%20apple%20of%20my%20eye/You-are-the-apple-of-my-eye2.jpg
 */
photo.api('detect', 'POST', {}, {
  url: 'http://luonggiaviet.com/Image/Editor/Img/DanhGia/Phim/Ngoc%20Ha/You%20are%20the%20apple%20of%20my%20eye/You-are-the-apple-of-my-eye2.jpg'
}, function(error, res, body) {
  return console.log(body);
});
```


## Contributing

Contributions welcome; Please submit all pull requests against the master branch.

## Author

Minh Thanh <nlug27@gmail.com> [http://github.com/nlug](http://github.com/nlug)

## License

 - **MIT** : http://opensource.org/licenses/MIT