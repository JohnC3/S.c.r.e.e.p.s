var linkControl = {
    run:function(spawn){
        
        var a_spawn = Game.spawns[s];

        var r = a_spawn.room;
        var room_level = Game.spawns[s].room.controller.level;
        var r_storage = r.storage;
        
        var sources = r.find(FIND_SOURCES);
        
        


        
        if(r_storage != undefined){
            
            var linkTos = r_storage.pos.findInRange(FIND_MY_STRUCTURES, 2, 
                {filter: {structureType: STRUCTURE_LINK}});
                
            var otherLinks = r_storage.room.find(FIND_MY_STRUCTURES,{filter: s => s.structureType == STRUCTURE_LINK && s.id != linkTos[0].id} );
                
            
            if(r.memory.invert){
                var temp = linkTos;
                var linkTos = otherLinks;
                var otherLinks = temp;
                
            }

            for(var j in linkTos){
                var linkTo = linkTos[j];
                
            
                for(var i in otherLinks){
                    var linkFrom = otherLinks[i];
                    
                    //var linkFrom = sources[i].pos.findInRange(FIND_MY_STRUCTURES, 3, 
                    //    {filter: s => s.structureType == STRUCTURE_LINK && s.energy > 700})[0];
                    if(linkFrom != undefined){
                        linkFrom.transferEnergy(linkTo);
                    }
                }
            }
        }
    }
}

module.exports = linkControl;