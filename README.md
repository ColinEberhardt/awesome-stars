#Awesome Stars!

A tool for adding star counts, and updating redirected URLs, for awesome lists.

## Usage

Install from npm:

```
$ npm install -g awesome-stars
```

Run this tool on the command link:

```
$ awesome-stars -h

  Usage: cli [options]

  Options:

    -h, --help               output usage information
    -V, --version            output the version number
    -i, --infile [file]      Input file
    -o, --outfile [file]     Output file
    -b, --bold [starCount]   Embolden links if the star count exceeds the given number
    -u, --username [string]  GitHub username
    -p, --password [string]  GitHub password or token
```

Here's an example usage where stars are added, and links with >5,000 stars are emboldened:

```
$ awesome-stars -i README.md -o README_STARRED.md -u ColinEberhardt -p ##GITHUB_TOKEN## -b 5000
```

Given the following source:

```
## Dependency Managers

*Dependency manager software for Swift.*

* [Carthage](https://github.com/Carthage/Carthage) - a new dependency manager for Swift.
* [CocoaPods](https://github.com/CocoaPods/CocoaPods) - the most used dependency manager for Objective-C and Swift (Swift supported since version 0.36.0).
* [Conche](https://github.com/Conche/Conche) - Swift build system and dependency manager.
* [swift-package-manager](https://github.com/apple/swift-package-manager) - SPM is the Package Manager for the Swift Programming Language.
```

It outputs the following:

```
## Dependency Managers

*Dependency manager software for Swift.*

* [**Carthage ★6,615**](https://github.com/Carthage/Carthage) - a new dependency manager for Swift.
* [**CocoaPods ★7,736**](https://github.com/CocoaPods/CocoaPods) - the most used dependency manager for Objective-C and Swift (Swift supported since version 0.36.0).
* [Conche ★148](https://github.com/Conche/Conche) - Swift build system and dependency manager.
* [swift-package-manager ★3,931](https://github.com/apple/swift-package-manager) - SPM is the Package Manager for the Swift Programming Language.
```
