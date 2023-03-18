---
title: "Reading Repos - E1 - Searching For Files That Contain Sets of Strings"
tags: Tooling Tips-and-Tricks
series_name: reading-repos
---

Every so often, I'll be faced with some systemic problem in a codebase and I'll want to get a better idea of the scope of the problem.
Usually, it will be some pattern that is repeated throughout a bunch of different files throughout the codebase.
For simple cases where you can match the pattern against a regular expression, which is going to be the case probably 95% of the time, you can just use grep. 

For the other 5% of cases you'll need to get fancy with piping tools together. 
An example of the 5% of cases would be if you want to find some files that match a set of regular expressions regex but also don't match against another set. 

Since I can never find the right combination of search terms to quickly get an answer on how to do this, I figured I'd write this article for my own knowledge base.
If this manages to help someone else along the way, even better.

## tl;dr

`find . -type f -exec grep -l 'extends MyBaseClass' {} \; | xargs grep -L 'myArg\.'`

* `-l` will output all filenames of files that match the pattern you pass to grep
* `-L` will output all filenames of files that DON'T match the pattern you pass to grep

Pipe to additional calls of `xargs grep` to add additional rules to search for files

NOTE: this is really slow. It took my 2019 computer ~30s to search through ~5000 files using a combination similar to the above, with the first grep trimming those files down to ~150.

## Explanation

For this example, I've got a codebase of a java webapp. 
I want to find all classes that are:
* child classes of **MyBaseClass**
* Don't use any method or property from one of the arguments of one of the abstract methods of **MyBaseClass** called **myArg**

To find all classes that are child classes of MyBaseClass, we'll use this:

`find . -type f -exec grep -l 'extends MyBaseClass' {} \;`

The `-exec` flag allows us to pass in the grep commmand, and will only produce files that match the expression we are passing to grep.

We'll pass this filtered list of commands to the following:

`xargs grep -L 'myArg\.'`

`xargs` will convert the stdin values to be input for the command itself in a sensible way, in this case individual lines of the output. 

The `-L` flag will output only the filenames of files that DO NOT match the pattern we've passed in. 

This produces the final list of files that match the criteria we are looking for. 
The full command then becomes:

`find . -type f -exec grep -l 'extends MyBaseClass' {} \; | xargs grep -L 'myArg\.'`

I will note that since we are invoking grep individually for every single file in the code base, multiple times in fact, that this command is very slow.
Execution times will vary based on how many files are in the codebase, how long the average file is and how complicated your regular expressions are.
I'll leave it as an exercise for the reader to determine some general rules for which expressions should be evaluated first and on a greater number of files.
