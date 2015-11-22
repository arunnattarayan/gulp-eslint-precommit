# Gulp Eslint pre-commit
linting is what keeps our code clean and good looking.
I like to follow the [Google js style guide](https://google.github.io/styleguide/javascriptguide.xml) when linting the js files.

Most of the gulp plugins and examples I came across with were linting ALL of the js files.
That is causing few problems:
* If for some reason someone pushed code that doesn't pass linting, you try to push your code but stuck because of the other code. And then you both try to fix it and.. conflicts.
* Linting all of your files all the time could work if used since the beginning of the project. But, when trying to add linting in an already existing project it becomes an impossible mission.
* It is dammmn too slow in big projects!

I also saw some plugins that doesn't lint all of the files, but for each file they run git status [file_path], which is very slow!

In this example I tried to create a fast and easy to use gulp code that will fix all of these problems.

# Steps
Install the dependencies:
```
npm install
```

Please pay attention to this part in the ```package.json``` file:
```
"eslintConfig": {
  "extends": "google"
}
```
This section is what links eslint configurations to the Google js style guide that was installed in the package [eslint-config-google](https://www.npmjs.com/package/eslint-config-google).
<br><br>
Go to the file **js-to-play-with/play.js** and remove the comments: ```/*eslint-disable*/``` and ```/* eslint-enable */```

run:
```
gulp lint
```
This task also takes 2 parameters:
<br>
**--all** - will lint ALL of the js files and not just the ones you've worked on.
<br>
**--show** - will show you the list of files it is trying to lint (useful when also using the --all parameter)

So how does the pre-commit git hook works?
When installing the package: [guppy-pre-commit](https://github.com/therealklanni/guppy-pre-commit) all you need to do is to create this task:
```
gulp.task('pre-commit', ['lint']);
```
The name **pre-commit** is important and has to be called that way.

Hope this helps someone else :-)

## License

    Copyright 2015 Or Kazaz

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
