# rocketchat_wakeonlan_bot

## Bot configuration
Edit the `docker_compose.yml` file and set values to the variables `HOST`, `USER` and `PASS`. You can find more information about how to create the bot in the Rocketchat [here](https://developer.rocket.chat/bots/creating-your-own-bot-from-scratch). It is important to emphasize that you need to create your bot account in the Rocketchat before running this software.

## Bot execution
You can execute the command `docker-composer up` to initiate the bot. The Bot will connect to the Rocketchat platform, and the bot will be able to receive DM messages.

## Available commands
- To send WakeOnLan: `wakeonlan <MAC_ADDRESS>`
- To discover MAC address from IP: `discover mac <IP_ADDRESS>`
- To discover IP address from MAC: `discover ip <MAC_ADDRESS>`
- To list ARP table: `list arp`
