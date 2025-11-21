# IsThereAnyDeal game-specific links on EpicGames Store
## Puts a game-specific IsThereAnyDeal link to the game pages on Epic Games Store
*Clicking the button opens the game's page* on IsThereAnyDeal*

![screenshot](https://i.imgur.com/puMKWO1.jpeg)
<h2>How it works</h2>
The right page is found automatically in the background using a custom google search. You will not see it happen. As far as you will see, the right page should just pop up.

## Wrong results
The method used is usually accurate, however, you should pay some attention to what page is opened. The wrong page may be opened if: 
1. ITAD doesn't have the game, so google finds some other game that is close in name
2. ITAD has multiple version of the same game, so google may find the wrong one, however, it does <b>usually</b> find the right one.
3. Google simply returns the wrong ITAD page due to bad indexing or whatever other reason (rare)

## Reliable alternative option
If you wish, you can change an option in the Tampermonkey menu so that the button opens the ITAD search results page instead.
![screenshot](https://i.imgur.com/Ejb0JRI.png)

This is 100% reliable and will skip the less reliable (though mostly accurate anyway) automatic background process explained above.


_Currently, the ITAD button is only added for the specific product that the page is for. So no separate buttons for different editions or addons/DLC/what have you, unless you open the separate page for that edition/DLC._

____

[GitHub direct install](https://github.com/OneNot/Userscripts/raw/main/IsThereAnyDeal%20game-specific%20links%20on%20EpicGames%20Store/index.user.js) | [Greasyfork page](https://greasyfork.org/en/scripts/414411-isthereanydeal-game-specific-links-on-epicgames-store)
