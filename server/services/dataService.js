class DataService {
    getData(req,res){
        res.send('Hello man')
    }
}
module.exports = new DataService()