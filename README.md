# VocRainer

This is a project to install your own custom flash card trainer to your mobile device as offline web app. 
The project was motivated by me not finding any app that fit my needs. Especially the training algorithms were worse the more advertised and most apps were not offline usable. 
So I hope, I will develop a better one in this project. So far there is a simple algorithm which should already be better, I hope.

## Feature list

* offline capable
* sync with many devices and your main pc by setting up a mini server
* quiz algorithm for better learning, chooses words in a way that old are repeated first
* uses lectures (1 per word) and tags (0 to infty per word) for nice sorting
* reads words in correct language
* easy add new words / edit them, extra comment section


## Compatibility

Not worked on this so far. I use a Mac as server and an iPhone 13 as mobile device. As languages I use German and Japanese. The userinterface is so far in English. I use vocabulary list from Marugoto (https://www.marugoto.org/en/).


## Setup

* Download the project to a device with Apache with SSL, PHP, and SQLite installed. 
* SQLite needs its own folder called "db" which needs to be write accessible for the browser ($ chown \_www folder)
* download jquery and jquery mobile and adjust paths in index.html
* Adjust path to your csv in php/readcsv.php and open this page with your browser. 
* Open index.html with browser and go to Settings. There you can synchronise, thus upload, the data into the app.
* Load your vocabulary from a cvs into the SQLite by clicking the button in Settings
* On mobile phone, open index.html and save to home screen
* In order for offline functionality to work (ServiceWorker), the website needs to be served via SSL. You can make a self signed licence. Opening this in Safari might require to open it first in private mode, then normal mode. Also in order to have a custom icon on iOS you need to serve the homescreen icon via standard http. So you need to setup virtual hosts to have SSL and normal in parallel pointing to the same directory. (see also https://developer.apple.com/forums/thread/92304)


## Hint for developers

Mac: reload page without caching to get new js scripts running: Shift + klick the reload button


## Frameworks

* jquery-v2.0.3, 
* jquery.mobile-1.4.0
* Speach Synthesis Web API


## Links
* jquery icons: https://demos.jquerymobile.com/1.4.5/icons/
* iOS Webapp:
https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html
* Offline web app: http://diveintohtml5.info/offline.html

# Implementation details


## Timing the quiz

Start time is set
* at app load
* load of page quizword

Durations are adjusted
* set 0 
** at app start
** in quiz summary
* add duration
** quiz summary 
** edit in quizword
** save in quizword
** in loadpage if previous page is quiz and next is not 
** NOT in quiz cancel, but this should be handeled in summary

## Databases and sync

There are several databases used:
* a csv file which I exported from other flashcard apps so that I do not need to fill vocabulary again by hand
* a server-site SQLite DB
* a client site IndexedDB 

The SQLite DB and the IndexedDBs can sync with each other. The client site dominates, i.e. overrides changes at server site. 

There are options to sync the client site DB: 
* press sync in settings
* automatic sync at page reload (in db.js after open db)
* when a new page is loaded and lastsync > 1h.  Not if in the middle of a quiz.


