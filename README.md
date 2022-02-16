# VocRainer

This is a project to install your own custom flash card trainer to your mobile device as offline web app. 
The project was motivated by me not finding any app that fit my needs. Especially the training algorithms were worse the more advertised and most apps were not offline usable. 
So I hope, I will develop a better one in this project. So far there is a simple algorithm which should already be better, I hope.


# Compatibility

Not worked on this so far. I use a Mac as server and an iPhone 13 as mobile device. As languages I use German and Japanese. The userinterface is so far in English. I use vocabulary list from Marugoto (https://www.marugoto.org/en/).


# Setup

* Download the project to a device with Apache, PHP, and SQLite installed. 
* SQLite needs its own folder called "db" which needs to be write accessible for the browser ($ chown \_www folder)
* download jquery and jquery mobile and adjust paths in index.html
* Adjust path to your csv in php/readcsv.php and open this page with your browser. 
* Open index.html with browser and go to Settings. There you can synchronise, thus upload, the data into the app.
* Load your vocabulary from a cvs into the SQLite by clicking the button in Settings
* On mobile phone, open index.html and save to home screen
* In order for offline functionality to work (ServiceWorker), the website needs to be served via SSL. You can make a self signed licence. Opening this in Safari might require to open it first in private mode, then normal mode. Also in order to have a custom icon on iOS you need to serve the homescreen icon via standard http. So you need to setup virtual hosts to have SSL and normal in parallel pointing to the same directory. (see also https://developer.apple.com/forums/thread/92304)


# Hint for developers

Mac: reload page without caching to get new js scripts running: Shift + klick the reload button


# Frameworks

* jquery-v2.0.3, 
* jquery.mobile-1.4.0


# Links
* jquery icons: https://demos.jquerymobile.com/1.4.5/icons/
* iOS Webapp:
https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html
* Offline web app: http://diveintohtml5.info/offline.html