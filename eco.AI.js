/*

 * Manages the economy of my holdings, primary jobs are tracking income vs spending.  
 
 * Creates the bodies of creeps as needed
 
 * Calculate how many creeps are needed by job, for example 
    * how many trucks are needed to move everything back home
    * how much energy are the upgraders useing 
    * how many reps will a builder get done? 
*/
var ecoAI = {
    
    energyHistory:function(spawn){
        
        if(Memory.blackLedger == undefined){
            Memory.blackLedger = {}
        } else if(blackLedger[spawn.name] == undefined){
            blackLedger[spawn.name] = {'Energy_Harvested':[],'Max_energy_harvested':[]};
        }
        
        
        
        
    },
    // Compute optimal number of upgraders.
    optimalUpgraders:function(SpawnLoc,upgrader_body, budget = 2000 , income_per_300 = 3000){
        
        roomName = SpawnLoc.room.name;
        
        console.log(SpawnLoc.name)
        // By default creeps live for only 1500 ticks        
        var life_span = 1500;

        var body_cost = ecoAI.bodyCost(upgrader_body);
        
        console.log('body_cost '+body_cost)
        
        // Each creep will travel 2 times the distance from the energy source to the controller at a speed determined by its body. So the approximate number of ticks a creep spends intransit are as follows.
        var ticks_per_trip = 2*ecoAI.upgradeDistance(roomName)*ecoAI.moveSpeed(upgrader_body);
        
        console.log('ticks_per_trip '+ticks_per_trip)
        // It will take a number of ticks equal to the creeps CARRY capacity / number of work parts to complete its job.
        
        var carryCapacity = 50*(_.filter(upgrader_body,function(p){return p == CARRY}).length);
        
        console.log('carryCapacity '+carryCapacity)
        var workParts = _.filter(upgrader_body,function(p){return p == WORK}).length
        
        console.log('workParts'+workParts)
        
        // Number of ticks a single job will bring about.
        var ticks_of_work = Math.ceil((carryCapacity)/workParts);
        
        console.log('ticks_of_work '+ticks_of_work)
        
        // Total number of ticks to get energy insert it and return
        var ticks_per_job = ticks_of_work + 2* ticks_per_trip
        console.log('ticks_per_job '+ticks_per_job)
        
        
        // Number of trips in lifetime
        var jobs_in_life = Math.floor(life_span/ticks_per_job)
        console.log('jobs_in_life '+jobs_in_life)
        
        
        // Energy used for work in lifetime
        lifetime_energy_contribution = Math.floor(life_span/ticks_per_job) * carryCapacity
        console.log('lifetime_energy_contribution '+lifetime_energy_contribution)
        
        // Total energy cost of one creep in its operationa life
        total_energy_cost = lifetime_energy_contribution + body_cost
        console.log('total_energy_cost '+total_energy_cost)
        
        // Total energy in the budget for the room over the course of one lifetime
        total_energy_in_budget = budget * (1500/300)
        console.log('total_energy_in_budget '+total_energy_in_budget)
        
        // How many are needed to do the work?
        var upgraders_needed = Math.round(total_energy_in_budget/total_energy_cost)
        
        console.log('upgraders_needed '+upgraders_needed)
        
        if(upgraders_needed == 0){
            upgraders_needed = 1;
        }
        
        //How efficent is it? In terms of creep cost vs work done?
        var energy_efficency = lifetime_energy_contribution/total_energy_cost
        
        console.log('energy_efficency '+energy_efficency)
        
        return upgraders_needed
    },
    // Compute the energy cost of the miners trucks, linkers and distributers
    harvestCost:function(SpawnLoc, numMiners = 2,numTrucks = 2,numDistributers = 1, budget = 2000 , income_per_300 = 3000){
        console.log(SpawnLoc.name+' must alocate at least this much energy to maintain its miners trucks and distributers')
        
        var roomName = SpawnLoc.room.name;
        
        var miner_body_cost = ecoAI.bodyCost(Memory.creepBody[roomName]['miner']);
        
        console.log('miner_body_cost '+miner_body_cost)
        
        var transport_body_cost = ecoAI.bodyCost(Memory.creepBody[roomName]['transport']);
        
        console.log('transport_body_cost '+transport_body_cost)
        
        
        // All linkers have the same body 
        var linker_body_cost = ecoAI.bodyCost([CARRY,CARRY,CARRY,CARRY,MOVE]);
        
        console.log('transport_body_cost '+transport_body_cost)


        // By default creeps live for only 1500 ticks        
        var life_span = 1500;
        
        // To maintain this rate we require 
        
        var total_build_cost = miner_body_cost*numMiners + transport_body_cost *(numTrucks + numDistributers) + linker_body_cost;
        
        console.log('total_build_cost '+total_build_cost)

        // Total energy harvested during this period
        var total_energy_in_budget = income_per_300 * 5
        console.log('total_energy_in_budget '+total_energy_in_budget)
        
        // What portion of the energy is budgeted towards them?
        var budget_needed = (total_build_cost/total_energy_in_budget) * income_per_300
        console.log(budget_needed);
        
        
        return budget_needed
    },
    
    
    // Compute the distance between the controller and the storage (or spawn if no storage is available)
    upgradeDistance:function(roomName){
        // Step one find a path
        var base = Game.rooms[roomName];
        


        // Distance between storage and spawn and spawn and  for storage.
        
        if(base != undefined){
            
            if(base.storage){
                var path = base.findPath(base.storage.pos,base.controller.pos,ignoreCreeps = true);
            } else{
                var spawn = base.find(FIND_STRUCTURES,{filter: s => s.structureType == STRUCTURE_SPAWN})[0];
                var path = base.findPath(spawn.pos,base.controller.pos)
            }
            // If a link is being used use it instead.
            if(base.memory.invert){
                var link = base.controller.pos.findInRange(FIND_MY_STRUCTURES, 6,{filter: {structureType: STRUCTURE_LINK}})[0];
                var path = base.findPath(link.pos,base.controller.pos)
            }
            
            
            return path.length
        }
        else{
            console.log('undefined again')
        }
        
    },
    

    // Compute how many ticks a creep with a body of that type needs to move across a plane, road, or swamp.
    moveSpeed:function(body,terrain = 'plane'){
        
        var move_rate = 0;
        
        var Tfactor = {'road':1,'plane':2,'swamp':10}[terrain];
        var moveParts = 0;
        var otherParts = 0;
        for(var i = 0; i < body.length;i++){
            if(body[i] == 'move'){
                moveParts += 1;
            } else{
                otherParts += 1;
            }
        }
        if(moveParts == 0){
            return 1000;
        }
        var F = Tfactor*otherParts;
        while(F > 0){
            move_rate += 1;
            F = F - moveParts*2;
        }
        return move_rate;
    },
    
    // Compute the cost of a given creep body.
    bodyCost:function(body){
        var partCost = {work:100,carry:50,move:50,tough:10,claim:600,attack:80,ranged_attack:150,heal:250};
        var total = 0;
        for(var i = 0; i<body.length; i++){
            total = total + partCost[body[i]]; 
            
        }
        return total;
    }
    
    
    
}



module.exports = ecoAI;