# Gulp Eslint pre-commit
The purpose: **lint only the files you've worked on in this commit**.

linting is what keeps our code clean and good looking.
I like to follow the [Google js style guide](https://google.github.io/styleguide/javascriptguide.xml) when linting the js files.

Most of the gulp plugins and examples I came across with were linting ALL of the js files.
That is causing few problems:
1. It is dammmn too slow in big projects! Linting all of the js files?!? are we crazy?! <br>
<h4>**Solution:**</h4> Lint ONLY the changed files.

* Linting all of your CHANGED files all the time could work if used since the **beginning** of the project.<br>
But, when trying to add linting in an **already existing project** it becomes an impossible mission. <br>
<h4>**Solution:**</h4> Lint ONLY the changed files **AND ONLY** the changed ROWS.

* If for some reason someone pushed code that doesn't pass linting (something on his local machine didn't work), you try to push your code but stuck because of the other code. And then you both try to fix it and.. conflicts. <br>
<h4>**Solution:**</h4> By linting only the changed rows in the changed files you won't even know if someone did it.

* I also saw some plugins that doesn't lint all of the files, but for each file they run git status [file_path], which is **very slow!** <br>
<h4>**Solution:**</h4> Perform a smarter way of checking the changed files and rows.

In this example I tried to create a fast and easy to use gulp code that will fix all of these problems.

# Steps
Install the dependencies:
```
npm install
```

Install gulp so you could use it in command line:
```
sudo npm install -g gulp
```

Please pay attention to this part in the ```package.json``` file:
```
"eslintConfig": {
  "extends": "google"
}
```
This section is what links eslint configurations to the Google js style guide that was installed in the package [eslint-config-google](https://www.npmjs.com/package/eslint-config-google).
<br><br>
Go to the file **js-to-play-with/play.js** and remove the comments: ```/*eslint-disable*/``` and ```/* eslint-enable */``` (don't forget to save the file..).

Now, let the magic happen!

Run:
```
gulp lint
```
This will run eslint on the file. But it will show only 2 errors and not 11+..<br> Why is that? <br>
Since the default option I did is to run ONLY on the changed files (OK we just changed the file), but ONLY on the changed ROWS. So we didn't changed any row with eslint errors.

So what should we do?

This task also takes 4 parameters:
<br>
**--all** - will lint ALL of the js files and not just the ones you've worked on.
<br>
**--show** - will show you the list of files it is trying to lint (useful when also using the --all parameter).
<br>
**--entire** - used to tell eslint to show errors on the entire file instead of just the changes rows.
<br>
**--path** - used to tell eslint which path to lint instead of linting only the changed files. This value could be
a regular expression and not just a specific file. For example: --path=apps/scomposer/\*\*/\*.js

So now try and run this command:
```
gulp lint --entire
```
Now it will lint all the changed files BUT the entire files and not just the changed rows.

##### Git pre-commit hook
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
