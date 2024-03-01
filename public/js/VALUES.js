
export { MATERIALS, TEXTURES, MODELS }


let MATERIALS = {

    "M_Glass": {
        displayedName: "Glass",
        material: undefined
    },
    "M_Glass_Black": {
        displayedName: "Black Glass",
        material: undefined
    },
    "M_Gold": {
        displayedName: "Gold",
        material: undefined
    },
    "M_Metal": {
        displayedName: "Metal",
        material: undefined
    },
    "M_Wood_Dark": {
        displayedName: "Dark Wood",
        material: undefined
    },
    "M_Wood_Brown": {
        displayedName: "Brown Wood",
        material: undefined
    },
    "M_Wood_Orange": {
        displayedName: "Orange Wood",
        material: undefined
    },
    "M_Wood_Light": {
        displayedName: "Light Wood",
        material: undefined
    },
    "M_White": {
        displayedName: "White",
        material: undefined
    },

    get: (name) => {
        return MATERIALS[name];
    }

    // new materials might be loaded with following loader.load() call
};



let TEXTURES = {

    'details': {
        name: 'Details',
        possibilities: [
            "M_Wood_Dark",
            "M_Wood_Brown",
            "M_Wood_Orange",
            "M_Wood_Light",

            "M_Metal",
            "M_White"
        ],
        objectNamesList: [
            '_details_inner',
            '_details_outer',
            '_details_lines',
            '_details_border'
        ]
    },

    'outerShell': {
        name: 'Outer shell',
        possibilities: [
            "M_Wood_Dark",
            "M_Wood_Brown",
            "M_Wood_Orange",
            "M_Wood_Light",

            "M_Metal",
            "M_White"
        ],

        objectNamesList: [
            '_shell',
            '_lid',
            '_smallAperture',
            '_ventilation',
            '_speakers_door'
        ]
    },

    'doors': {
        name: 'Doors',
        possibilities: [
            "M_Glass",
            "M_Glass_Black"
        ],

        objectNamesList: [
            '_door_left',
            '_door_right'
        ]
    }
};


let MODELS = {
    elevation: 0.129896,
    "left": {},
    "right": {},
    'leftOldFormatNOTUSED': [
        {
            path: '/assets/3DModels/RIGHT_big_drawer.glb',
            name: 'Big with a drawer'
        }
    ]
};
