const contactListener = {
    beginContact: null,
    BeginContact: function(contact) {
        // console.log('BeginContact', contact)
        this.beginContact = contact
        let fixA = contact.GetFixtureA()
        let fixB = contact.GetFixtureB()

        if (fixA.GetType() == fixB.GetType()) {
            console.log('as fix sao iguais', fixA.GetType(), fixB.GetType())
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
        let ret = this.beginContact
        this.beginContact = null
        return ret
    }
}

export default contactListener