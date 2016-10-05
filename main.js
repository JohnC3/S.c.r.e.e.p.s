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
var roleArcher = require('role.archer');
var roleCollector = require('role.collector');
var spawnControl = require('spawnControl');
var roleMaintance = require('role.maintance')
var tower = require('towerControl')
var linkControl = require('linkControl')

module.exports.loop = function () {

    // If a miner is an old miner create a replacement but keep working.
    // role to code used in role hash
    var creep_type = {'claimer':roleClaim,'harvester':roleHarvester,'upgrader':roleUpgrader,'builder':roleBuilder,'miner':roleMiner,'collector':roleCollector,
    'truck':roleTruck,'trooper':roleTrooper,'knight':roleTrooper,'raider':roleTrooper,'healer':roleHealer,'distributer':roleDistributer,'linker':roleLinker,'maintance':roleMaintance};
    
    //
    if (Memory.N > 100 || Memory.N == undefined){
        Memory.N = 1;
    }
    
    if (Memory.T> 50 || Memory.N == undefined){
        Memory.T = 1;
    } else{
        Memory.T += 1;
    }
    
    
    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }

        
    }
    Memory.miners = new Array();
    Memory.occupied_sources = new Array();
    
    // Track the population of creeps.
    Memory.population = {}
    
    // Fill population with keys corresponding to every role.
    
    var all_existing_roles = Object.keys(creep_type);
    
    for (var i in all_existing_roles){
        
        var r = all_existing_roles[i];
        Memory.population[r] = {'total':0,'station':{'W52S33':0},'room':{'W52S33':0}};
        
    }
    
    // Loop that lists a creep name and role for every creep.
    for(var name in Game.creeps) {

        var creep = Game.creeps[name];

        // Manage population numbers
        if(Memory.population[creep.memory.role] == null || Memory.population[creep.memory.role] == undefined){
            Memory.population[creep.memory.role] = {'total':0,'station':{},'room':{}}
        }
        Memory.population[creep.memory.role]['total'] += 1;
        
        // What room is it stationed in? If it has a add that station to the dictionary then add the creep station add it to said station.
        if (creep.memory.station != undefined){
            
            if(Memory.population[creep.memory.role]['station'][creep.memory.station] == null || Memory.population[creep.memory.role]['station'][creep.memory.station]  == undefined ){
                Memory.population[creep.memory.role]['station'][creep.memory.station] = 0;
            }
            Memory.population[creep.memory.role]['station'][creep.memory.station] += 1;
        }
        // What room is it currently in?
        if(Memory.population[creep.memory.role]['room'][creep.room.name] == null || Memory.population[creep.memory.role]['room'][creep.room.name]  == undefined ){
            Memory.population[creep.memory.role]['room'][creep.room.name] = 0;
        }
        Memory.population[creep.memory.role]['room'][creep.room.name] += 1;
 
 
 
        // If a creep is set to trace create a road at its location every tick.
        if(creep.memory.trace){
            creep.room.createConstructionSite(creep.pos,STRUCTURE_ROAD);
        }
        
        
        if (creep.memory.role == 'miner'){
            Memory.miners.push(creep);
        }
        
        
        creep_type[creep.memory.role].run(creep);

    }
    
    for( var r in Game.rooms){
        
        current_room = Game.rooms[r]
        
        var enemy_creeps = current_room.find(FIND_HOSTILE_CREEPS);
        var claim_this_room = Game.flags['Take this room']
        
        // Rooms I plan to take dont get defended
        if(claim_this_room.room == current_room){
            // Move troops in once safe mode starts to wear off.
            if(current_room.controller.safeMode < 500){
                Game.flags.troops.setPosition( new RoomPosition(25,25, r))
            }
            
        }
        else{
            if(enemy_creeps.length > 0 && current_room.name != 'W54S32'){
                
                //Temporary safe mode activation code
                
                if (current_room.name == 'W52S33'){
                    current_room.controller.activateSafeMode();
                }
                
                
                try{
                    Game.flags.troops.setPosition( new RoomPosition(25,25, r))
                }
                catch(TypeError){
                    //Game.flags.createFlag()
                }
            }            
        }
 
    }

    // Set up remote mining operations.
    spawnControl.remote_source_mine("W53S32",Game.spawns.Spawn3,3,1,1);
    spawnControl.remote_source_mine("W54S33",Game.spawns.Spawn3,3,1,1);
    spawnControl.remote_source_mine("W51S33",Game.spawns.Spawn1,2,1,1);
    
    spawnControl.remote_source_mine("W51S34",Game.spawns.Spawn4,2,1,1);
    spawnControl.remote_source_mine("W52S35",Game.spawns.Spawn4,2,1,1);
    spawnControl.remote_source_mine("W53S34",Game.spawns.Spawn4,2,1,1);
    spawnControl.remote_source_mine("W53S35",Game.spawns.Spawn4,2,1,1);
    
    for(s in Game.spawns){

        spawnControl.run(s)
        // Test that the custom made workers are well working
        
        //var x = bodyBuilder.largest_upgrader(a_spawn)
        //ecoAI.optimalUpgraders(a_spawn,x)
        //ecoAI.harvestCost(a_spawn)

        linkControl.run(s)
  
        tower.run(s);

    }
}