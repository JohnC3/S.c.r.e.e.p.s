var ecoAI = require('eco.AI');
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleMiner = require('role.remoteMiner');
var roleDistributer = require('role.distributer');
var roleLinker = require('role.linker');
var roleTrooper = require('role.trooper');
var roleTruck = require('role.truck');
var roleClaim = require('role.claim');
var roleHealer = require('role.healer');
var roleCollector = require('role.collector');
var roleCivilian = require('role.civilian');
var labWorker = require('role.labWorker')
var lab = require('lab.control')



var spawnCommands = require('spawn.commands');
var spawnControl = require('spawnControl');

var roleMaintance = require('role.maintance');
var tower = require('towerControl');
var linkControl = require('linkControl');
var intel = require('military.intelligence');

var transitAI = require('transit.AI');

/*
RoomObject.prototype.hello = function() { console.log(hello);};

For example, I have a prototype that merges `creep.harvest`, `creep.transfer` and `creep.withdraw` all into a single `creep.pull` module

[7:55]  
So my creeps can pull energy from whatever their target happens to be without a big unwieldy codeblock checking each stage

https://gist.github.com/Puciek/641e5f89246958167774e384b65af7a6
*/

module.exports.loop = function () {
    

    
    //transitAI.clear_roads()
    
    // Arrays for the remoteMiner code. They need to be here.
    
    Memory.miners = new Array();
    Memory.occupied_sources = new Array();
    ecoAI.run()
    
    Memory.myDomain = new Array();

    intel.defense()

    // If a miner is an old miner create a replacement but keep working.
    // role to code used in role hash
    var creep_type = {'claimer':roleClaim,'harvester':roleHarvester,'upgrader':roleUpgrader,'builder':roleBuilder,'miner':roleMiner,'collector':roleCollector,
    'truck':roleTruck,'trooper':roleTrooper,'knight':roleTrooper,'raider':roleTrooper,'healer':roleHealer,'distributer':roleDistributer,'linker':roleLinker,
    'maintance':roleMaintance,'civilian':roleCivilian,'scout':roleTrooper,'labWorker':labWorker};
    
    //
    if (Memory.N > 100 || Memory.N == undefined){
        Memory.N = 1;
    }
    
    if (Memory.T> 100 || Memory.N == undefined){
        Memory.T = 1;
    } else{
        Memory.T += 1;
    }
    
    // Delete dead creeps from memory
    for(var i in Memory.creeps) {
        

        
        if(!Game.creeps[i]) {
            
            // get the memory of the dead creep.
            var dead_creep = Memory.creeps[i]
            // For each creep that you delete record its details!
            
            /*
            if(dead_creep['role'] == 'miner'){
                Memory.miner_efficency.push({'name':i,'station':dead_creep['station'],'energy_harvested':dead_creep['energy_harvested']})
            }
            else if(dead_creep['role'] == 'truck'){
                Memory.truck_efficency.push({'name':i,'station':dead_creep['station'],'drop_location':dead_creep['drop_location'],'energy_taken':dead_creep['energy_pickedup'],'energy_delivered':dead_creep['energy_delivered']})
            }
            */
            
            
            
            delete Memory.creeps[i];
        }

    }
    

    
    // Track the population of creeps.
    Memory.population = {}
    
    if(Memory.recorded_rooms == undefined){
        Memory.recorded_rooms = Object.keys(Game.rooms);
    }
    
    var observed_room = Object.keys(Game.rooms)
    
    for (var r in observed_room){
        
        if(r == "W53S33"){
            lab
        }
        
        
        
        var rname = observed_room[r]
        if(Memory.recorded_rooms.indexOf(rname) == -1){
            
            Memory.recorded_rooms.push(rname)
        }
    }
    // Fill population with keys corresponding to every role.
    
    var all_existing_roles = Object.keys(creep_type);
    
    // Build the memory structure containing the population data. 
    for (var i in all_existing_roles){
        
        var r = all_existing_roles[i];
        Memory.population[r] = {'total':0,'creeps':[],'station':{},'room':{}};
        for(var recorded_room in Memory.recorded_rooms){
            r_name = Memory.recorded_rooms[recorded_room];
            Memory.population[r]['station'][r_name] = 0;
            Memory.population[r]['room'][r_name] = 0;
            
            // Lowest ticks to live will also be recorded.
            
            //Memory.population[r]['station']['TTL'+r_name] = 1500;
           
            //Memory.population[r]['room']['TTL'+r_name] = 1500;
            
            
        }
    }
    
    // Loop that incraments the values in the population info.
    for(var name in Game.creeps) {
        
        var creep = Game.creeps[name];
        
        // The role of the given creep.
        var cRole = creep.memory.role;
        
        // The station of the creep as set in the creeps memory
        var cStation = creep.memory.station;
        
        // The room the creep happens to be in.
        var cRoom = creep.room.name;
        
        // Incrament the total count of creeps of that role
        Memory.population[cRole]['total'] += 1;
        
        // Add the creep to the list
        Memory.population[cRole]['creeps'].push(creep);
        
        // If station not accounted for acont it
        if(Memory.population[cRole]['station'][cStation] == null){
            Memory.population[cRole]['station'][cStation] = 0
        }
        
        
        // Incrament the number of creeps stationed in said room.
        Memory.population[cRole]['station'][cStation] += 1;
        
        // Incrament the number of creeps who just are in the room
        Memory.population[cRole]['room'][cRoom] += 1;
        
    }
    
    for(var name in Game.creeps){
        
                var creep = Game.creeps[name];
 
        // If a creep is set to trace create a road at its location every tick.
        if(creep.memory.trace){
            creep.room.createConstructionSite(creep.pos,STRUCTURE_ROAD);
        }
        
        
        if (creep.memory.role == 'miner'){
            Memory.miners.push(creep);
        }
        
        if (creep.memory.role == undefined){
            creep.suicide()
        }
        
        creep_type[creep.memory.role].run(creep);

    }
    
    // Set up remote mining operations.
    spawnCommands.remote_source_mine("W53S32",Game.spawns.Spawn3,2,1,1);
    spawnCommands.remote_source_mine("W54S33",Game.spawns.Spawn3,2,1,1);

    spawnCommands.remote_source_mine("W51S34",Game.spawns.Spawn1,2,1,1,claim=false,delivery_room = Game.spawns.Spawn4.room.name);
    spawnCommands.remote_source_mine("W52S35",Game.spawns.Spawn4,1,1,1);
    spawnCommands.remote_source_mine("W53S34",Game.spawns.Spawn4,1,1,1);
    spawnCommands.remote_source_mine("W53S35",Game.spawns.Spawn4,2,1,1);
    
    for(s in Game.spawns){

        spawnControl.run(s)

        linkControl.run(s)
  
        tower.run(s);

    }
}