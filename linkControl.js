var linkControl = {
    run:function(spawn){
        
        var a_spawn = Game.spawns[s];

        var r = a_spawn.room;
        var room_level = Game.spawns[s].room.controller.level;
        var r_storage = r.storage;
        
        var sources = r.find(FIND_SOURCES);
        
        


        
        if(r_storage != undefined){
            // Get the link for the storage.    
            var storage_link = r_storage.pos.findInRange(FIND_MY_STRUCTURES, 2, 
                {filter: {structureType: STRUCTURE_LINK}})[0];
            
            // Get the link nearist the controller if applicable.
            
            //var controller_link = r.controller.pos.findClosestByRange(FIND_MY_STRUCTURES,{filter: {structureType: STRUCTURE_LINK}})
            
            var controller_link = r.controller.pos.findInRange(FIND_MY_STRUCTURES, 6, 
                {filter: {structureType: STRUCTURE_LINK}})[0];
            
            if(storage_link){
                if(controller_link.id == storage_link.id){
                    controller_link = undefined;
                }
            }

            

                
            if(storage_link != undefined && controller_link != undefined){
                var otherLinks = r_storage.room.find(FIND_MY_STRUCTURES,{filter: s => s.structureType == STRUCTURE_LINK && s.id != storage_link.id && s.id != controller_link.id} );
            } else if(storage_link != undefined){
                var otherLinks = r_storage.room.find(FIND_MY_STRUCTURES,{filter: s => s.structureType == STRUCTURE_LINK && s.id != storage_link.id} );
            }
            
            // if the controller link exists send it power first.
            if(controller_link){
                for(var i in otherLinks){
                    var oLinks = otherLinks[i];
                    
                    if(controller_link.energy == 800){
                        oLinks.transferEnergy(controller_link)
                    }else{
                        oLinks.transferEnergy(storage_link)
                    }
                }
                
                if(controller_link.energy < 800){
                    
                    storage_link.transferEnergy(controller_link)
                }
                
            }else{
                
                for(var i in otherLinks){
                    var oLinks = otherLinks[i];
                    oLinks.transferEnergy(storage_link)
                }
                    
                
            }
            
            
            //var linkTos = r_storage.pos.findInRange(FIND_MY_STRUCTURES, 2, {filter: {structureType: STRUCTURE_LINK}});
                
            
            //var otherLinks = r_storage.room.find(FIND_MY_STRUCTURES,{filter: s => s.structureType == STRUCTURE_LINK && s.id != linkTos[0].id} );
                
            /*
            if(r.memory.invert){
                
                if(controller_link.energy < 800){
                    
                }
                
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
            }*/
        }
    }
}

module.exports = linkControl;