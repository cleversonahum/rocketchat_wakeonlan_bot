const { driver } = require('@rocket.chat/sdk');
const wol = require('wakeonlan')
const arp = require('@network-utils/arp-lookup');

// Environment Setup
const HOST = process.env.HOST;
const USER = process.env.USER;
const PASS = process.env.PASS;
const SSL = true;
console.log('HOST: ' + HOST);
console.log('USER: ' + USER);
console.log('PASS: ' + PASS);

var myUserId;

// Bot configuration
const runbot = async () => {
    const conn = await driver.connect({ host: HOST, useSsl: SSL })
    myUserId = await driver.login({ username: USER, password: PASS });

    const subscribed = await driver.subscribeToMessages();
    console.log('Subscribed');

    const msgloop = await driver.reactToMessages(processMessages);
    console.log('Connected and waiting for messages');
}

// Process messages
const processMessages = async (err, message, messageOptions) => {
    if (!err) {
        if (message.u._id === myUserId) return;
        console.log('Received message: ' + message.msg);
        var response = "";

        if (message.msg.toLowerCase().includes("wakeonlan")) {
            let mac_address = message.msg.match(/([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/g);
            if (mac_address) {
                try {
                    const wolPromises = mac_address.map(async (item) => {
                        try {
                            await wol(item);
                            success_msg = "WakeOnLan sent to MAC Address: " + item + "\n";
                            response += success_msg;
                        } catch (error) {
                            error_msg = "Error when sending WakeOnLan to MAC Address: " + item + "\n";
                            response += error_msg;
                        }
                    });

                    await Promise.all(wolPromises);
                } catch (error) {
                    console.error("Error occurred:", error);
                }
            } else {
                response = "MAC Address not found in message. Please use the format `aa:bb:cc:dd:ee:ff`.";
            }
        }
        else if (message.msg.toLowerCase().includes("discover mac")) {
            let ip_addresses = message.msg.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g);
            if (ip_addresses) {
                try {
                    const macPromises = ip_addresses.map(async (ipItem) => {
                        try {
                            const mac = await arp.toMAC(ipItem);
                            return { ip: ipItem, mac: mac };
                        } catch (error) {
                            console.error("Error getting MAC for IP:", ipItem);
                        }
                    });

                    const resolvedMACs = await Promise.all(macPromises);
                    resolvedMACs.forEach((item) => {
                        response += "IP Address: " + item.ip + " MAC Address: " + item.mac + "\n";
                    });

                } catch (error) {
                    console.error("Error occurred:", error);
                }
            } else {
                response = "IP Address not found in message. Please use a valid IP address format.";
            }
        }
        else if (message.msg.toLowerCase().includes("discover ip")) {
            let mac_address = message.msg.match(/([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/g);
            if (mac_address) {
                try {
                    const ipPromises = mac_address.map(async (macItem) => {
                        try {
                            const ip = await arp.toIP(macItem);
                            return { mac: macItem, ip: ip };
                        } catch (error) {
                            console.error("Error getting IP for MAC:", macItem);
                        }
                    });

                    const resolvedIPs = await Promise.all(ipPromises);
                    resolvedIPs.forEach((item) => {
                        response += "IP Address: " + item.ip + " MAC Address: " + item.mac + "\n";
                    });

                } catch (error) {
                    console.error("Error occurred:", error);
                }
            } else {
                response = "MAC Address not found in message. Please use the format `aa:bb:cc:dd:ee:ff`.";
            }
        }
        else if (message.msg.toLowerCase().includes("list arp")) {
            try {
                const arpTable = await arp.getTable();

                arpTable.forEach((entry) => {
                    const ip = entry.ip;
                    const mac = entry.mac;
                    const type = entry.interface;
                    response += "IP Address: " + ip + " MAC Address: " + mac + " Type: " + type + "\n";
                });

            } catch (error) {
                console.error("Error occurred:", error);
                response = "An error occurred while listing ARP table.";
            }
        }
        else {
            response = "Available functions:\n";
            response += "- To send WakeOnLan: 'wakeonlan <MAC_ADDRESS>'\n";
            response += "- To discover MAC address from IP: 'discover mac <IP_ADDRESS>'\n";
            response += "- To discover IP address from MAC: 'discover ip <MAC_ADDRESS>'\n";
            response += "- To list ARP table: 'list arp'\n";
        }

        console.log('Responding with: ' + response);
        const sentmsg = await driver.sendToRoomId(response, message.rid);
    }
}

runbot()
