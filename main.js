var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleMiner = require('role.miner');
var roleDistributer = require('role.distributer');
var roleLinker = require('role.linker');
var roleTrooper = require('role.trooper');
var roleArcher = require('role.archer')
var roleTruck = require('role.truck');
var roleClaim = require('role.claim');
var roleHealer = require('role.healer');
var roleArcher = require('role.archer');
var roleCollector = require('role.collector');
var roleDeconstructor = require('role.deconstructor');
var spawnControl = require('spawnControl');
var tower = require('towerControl')

module.exports.loop = function () {

    // If a miner is an old miner create a replacement but keep working.
    // role to code used in role hash
    var creep_type = {'claimer':roleClaim,'harvester':roleHarvester,'upgrader':roleUpgrader,'builder':roleBuilder,'miner':roleMiner,'collector':roleCollector,
    'truck':roleTruck,'trooper':roleTrooper,'knight':roleTrooper,'raider':roleTrooper,'healer':roleHealer,
    'archer':roleArcher,'deconstructor':roleDeconstructor,'distributer':roleDistributer,'linker':roleLinker};
    
    //
    if (Memory.N > 100 || Memory.N == undefined){
        Memory.N = 1;
    }
    

    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
        
    }
    
    Memory.miners = new Array();
    
    // Loop that lists a creep name and role for every creep.
    for(var name in Game.creeps) {
        
        
        
        var creep = Game.creeps[name];
        
        if (creep.memory.role == 'miner'){
            Memory.miners.push(creep);
        }
            
        if (creep.memory.role != 'miner'){
            creep_type[creep.memory.role].run(creep);
        }

    }
    
    
    for( var r in Game.rooms){

        roleMiner.run(r,300);
        var enemy_creeps = Game.rooms[r].find(FIND_HOSTILE_CREEPS);
        if(enemy_creeps.length > 0){
            Game.flags.knights.setPosition( new RoomPosition(27,9, r))
        } 
    }

    spawnControl.remote_source_mine("E28N52",Game.spawns.Spawn1,2);
    spawnControl.remote_source_mine("E28N53",Game.spawns.Spawn1,2);
    spawnControl.remote_source_mine("E28N51",Game.spawns.Spawn2,2);  

    for(s in Game.spawns){

        spawnControl.run(s);
        
        // This needs to be its own module.
        var a_spawn = Game.spawns[s];
        var r = a_spawn.room;
        var room_level = Game.spawns[s].room.controller.level;
        var r_storage = r.find(FIND_MY_STRUCTURES,{filter: s => s.structureType == STRUCTURE_STORAGE})[0];
        
        var sources = r.find(FIND_SOURCES);

        var linkTo = r_storage.pos.findInRange(FIND_MY_STRUCTURES, 2, 
            {filter: {structureType: STRUCTURE_LINK}})[0];
        
        for(var i in sources){
            
            var linkFrom = sources[i].pos.findInRange(FIND_MY_STRUCTURES, 3, 
                {filter: s => s.structureType == STRUCTURE_LINK && s.energy > 700})[0];
            if(linkFrom != undefined){
                linkFrom.transferEnergy(linkTo);
            }
        }
        
        
        if (_.filter(Game.creeps, (c)=>c.memory.role == 'claimer' && c.memory.station == 'E27N51').length < 1){
            var name = Game.spawns.Spawn1.createCreep([MOVE,MOVE,CLAIM,CLAIM],"Diplomat"+Memory.N,{'role':'claimer','station':'E27N51'});
        }
        
        // Run the tower code
        tower.run(r);

    }
}