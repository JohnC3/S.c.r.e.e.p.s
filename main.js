var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleMiner = require('role.remoteMiner');
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
    
    Memory.population = {}
    

    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }

        
    }
    
    Memory.miners = new Array();
    Memory.occupied_sources = new Array();
    
    // Loop that lists a creep name and role for every creep.
    for(var name in Game.creeps) {
        
            
            
        
        
        var creep = Game.creeps[name];
        
        if(creep.memory.trace){
            //creep.room.createConstructionSite(creep.pos,STRUCTURE_ROAD);
        }
        
        if (creep.memory.role == 'miner'){
            Memory.miners.push(creep);
        }
        if(Memory.population[creep.memory.role] == null || Memory.population[creep.memory.role] == undefined){
            Memory.population[creep.memory.role] = 0
        }
        Memory.population[creep.memory.role] += 1;
        creep_type[creep.memory.role].run(creep);

    }
    
    
    for( var r in Game.rooms){
        
        var hostiles = {};
        
        var enemy_creeps = Game.rooms[r].find(FIND_HOSTILE_CREEPS);
        if(enemy_creeps.length > 0){
            /*
            for(var i = 0; i < enemy_creeps.length;i++){
                var enemy = enemy_creeps[i];
                try{
                    Memory.attacks[enemy.owner].push([enemy.owner,Game.time,enemy.room.name])
                }catch(TypeError){
                    Memory.attacks[enemy.owner] = new Array();
                }
                
            }
            */
            try{
                Game.flags.knights.setPosition( new RoomPosition(27,9, r))
            }
            catch(TypeError){
                //Game.flags.createFlag()
            }
        } 
    }

    // Set up remote mining operations.
    spawnControl.remote_source_mine("E28N52",Game.spawns.Spawn1,1,1,1);
    spawnControl.remote_source_mine("E28N53",Game.spawns.Spawn1,2,1,1);
    spawnControl.remote_source_mine("E28N51",Game.spawns.Spawn2,1,1,1);
    //spawnControl.remote_source_mine("E27N51",Game.spawns.Spawn2,0,2,0);  
    spawnControl.remote_source_mine("E26N51",Game.spawns.Spawn3,1,1,0);
    spawnControl.remote_source_mine("E25N51",Game.spawns.Spawn3,1,1,0);
    
    for(s in Game.spawns){

        spawnControl.run(s);
        
        // This needs to be its own module.
        var a_spawn = Game.spawns[s];
        var r = a_spawn.room;
        var room_level = Game.spawns[s].room.controller.level;
        var r_storage = r.find(FIND_MY_STRUCTURES,{filter: s => s.structureType == STRUCTURE_STORAGE})[0];
        
        var sources = r.find(FIND_SOURCES);
        
        if(r_storage != undefined){

        var linkTo = r_storage.pos.findInRange(FIND_MY_STRUCTURES, 2, 
            {filter: {structureType: STRUCTURE_LINK}})[0];
        
        var otherLinks = r_storage.room.find(FIND_MY_STRUCTURES,{filter: s => s.structureType == STRUCTURE_LINK && s.id != linkTo.id && s.energy > 100} );
        
        for(var i in otherLinks){
            var linkFrom = otherLinks[i];
            
            //var linkFrom = sources[i].pos.findInRange(FIND_MY_STRUCTURES, 3, 
            //    {filter: s => s.structureType == STRUCTURE_LINK && s.energy > 700})[0];
            if(linkFrom != undefined){
                linkFrom.transferEnergy(linkTo);
            }
        }
        }
        
        //if (_.filter(Game.creeps, (c)=>c.memory.role == 'claimer' && c.memory.station == 'E27N51').length < 2){
        //    var name = Game.spawns.Spawn2.createCreep([MOVE,MOVE,CLAIM,CLAIM],"Diplomat"+Memory.N,{'role':'claimer','station':'E27N51'});
        //}
        
        // Run the tower code
        tower.run(r);

    }
}