import {getSensorBD} from '../models/sensorModel';

export const getSensor = async (req,res) => {
    try {
        const sensores = await getSensorBD();
    } catch (error) {
        
    }    
}