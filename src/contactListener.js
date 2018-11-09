const contactListener = {
    beginContact: null,
    BeginContact: function(contact) {
        // console.log('BeginContact', contact)
        this.beginContact = contact
        let fixA = contact.GetFixtureA()
        let fixB = contact.GetFixtureB()

        if ((fixA.GetUserData() == 'car' &&  fixB.GetUserData() == 'goal') || (fixA.GetUserData() == 'goal' &&  fixB.GetUserData() == 'car')) {
            console.log('chegou no goal', contact)
            contact.SetEnabled(false)
        }
    },
    EndContact: function(contact) {
        // console.log('EndContact', contact)
    },
    PostSolve: function(contact) {
        // console.log('PostSolve', contact)
    },
    PreSolve: function(contact) {
        // console.log('PreSolve', contact)
    },
    getBeginContact: function() {
        // console.log('getBeginContact', this.beginContact)
        let ret = this.beginContact
        this.beginContact = null
        return ret
    }
}

export default contactListener