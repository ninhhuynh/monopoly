# Monopoly

A web client-server multiplayer monopoly board game. Created using vue(mfe folder) for client and express(be folder) for backend.

# Client

[client](https://github.com/ninhhuynh/monopoly/new/main/mfe)

# Server

[server](https://github.com/ninhhuynh/monopoly/new/main/be)

# Demo
when the server has started

the player choose a name and a image, if one of these two is matched with another existing player, it will not be accepted, however, if both of them is matched, the client will join in as the existing player.
![join](https://github.com/ninhhuynh/monopoly/blob/main/Demo/join.jpg?raw=true)

Turn based dice roll movement, the server will decide who get to roll the dice, when a player move to a block, an action will be perform depend on what block is it, there will be property/chance/communitychest/tax/accountant/park/go/jail/police. if the player land on a property block, he/she can decide to buy it or end the turn
![property](https://github.com/ninhhuynh/monopoly/blob/main/Demo/property.JPG?raw=true)
![property](https://github.com/ninhhuynh/monopoly/blob/main/Demo/chest.JPG?raw=true)

when a property is bought an icon of the owner and a state(mortgage? housenumber?) will be shown on the property, if its the owner turn, an mortgage button will appear
![propown](https://github.com/ninhhuynh/monopoly/blob/main/Demo/propertyown.JPG?raw=true)![propnotown](https://github.com/ninhhuynh/monopoly/blob/main/Demo/propertynotown.JPG?raw=true)

if you press on an property owner icon, you can ask to trade that with the owner
![trade](https://github.com/ninhhuynh/monopoly/blob/main/Demo/trade.JPG?raw=true)

The owner will recieve a trading request (25 is the index of the property)
![tradereply](https://github.com/ninhhuynh/monopoly/blob/main/Demo/tradereply.JPG?raw=true)

the property owner will change afterwards
![tradesuccess](https://github.com/ninhhuynh/monopoly/blob/main/Demo/tradesuccess.JPG?raw=true)
