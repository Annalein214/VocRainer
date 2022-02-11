# TODO

## Priority
* delete words
* export to csv so that good changes will persist while developing

## Usability
* add tags in lecture list and quiz
* sync automatically
* word list: show both languages and level
* lecture list: show summed progress, enable searching, show number of words
* if program interrupted, save state (which side was open etc.)
* if quiz interrupted, reload from db table (half done)

## Extras
* add different quiz types: grammar, sentences, particle, kanji, spelling
* use tags as direct comparison of a list of words
* notes with overviews, such as numbers, etc.

## Better algorithm within quiz
* choose 5 variables from db and set them to L1, rest to L0
* once <= 3 in L1 or >0 in L6 take new variables, do not ask any longer for L6
* weight the occurence of variables: L1 9, L2 5, L3 3, L4 2, L5 1, i.e. with random numbers 0-100: L1 -45, L2 -70, L3 -85, L4 -95, L5 -100
* check always wich level exist. Exist\*level_weight/sum_weights added gives limits for random numbers

# Better algorithm to choose for quiz
* level and weights as above, but older variables get higher weight, maybe sort by date and use random numbers to verzerren 