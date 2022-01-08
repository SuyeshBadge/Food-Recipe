// const fetch = require('node-fetch')
import fetch from 'node-fetch'
import {
    createServer
} from 'http'
import {
    readFileSync
} from 'fs';

const index = readFileSync('./index.html', 'utf8');
const ingreds = readFileSync('./templates/ingredients.html', 'utf8')

const addIngridients = function (ing, qty) {
    let items = ''
    ing.forEach((e, i) => {
        items += `<li> <div class="table">
        <div class="div1">${e} </div>
        <div class="div2">${qty[i]}</div>
    </div></li>`
    })
    const itemTable = ingreds.replace('{%list%}', items)
    return itemTable

}
const addinstructions = function (ins) {
    let insSet = ''
    ins.forEach((e, i) => {
        insSet += `<div class="inst"> ${e}</div>`
    })
    return insSet
}
const replaceCardDetails = (data, i, q, ins) => {
    let output = index.replace('{%title%}', data.strMeal)
    output = output.replace('{%category%}', data.strCategory)
    output = output.replace('{%thumbnail%}', data.strMealThumb)
    output = output.replace('{%ingredients%}', addIngridients(i, q))
    output = output.replace('{%thumbnail%}', data.strMealThumb)
    output = output.replace('{%instructions%}', addinstructions(ins))
    return output

}

const server = createServer((request, response) => {
    console.log(`${response.statusCode} ${request.url} ${request.method}`);
    const path = request.url
    if (path === '/') {
        response.writeHead(200, {
            'Content-type': 'text/html'
        });
        getJson('https://www.themealdb.com/api/json/v1/1/random.php').then(res => {
            const data = res.meals[0]
            const Instructions = data.strInstructions.split("\n");
            Instructions.forEach((e, i) => {
                Instructions[i] = e.replace('\r', '');
            })
            // const mealName = data.strMeal;
            // const mealCategory = data.strCategory;
            // const imgPath = data.strMealThumb;
            // const mealVideo = data.strYoutube;
            let ingredient = []
            for (let i = 1; i <= 20; i++) {
                if (!data[`strIngredient${i}`]) break;

                ingredient.push(data[`strIngredient${i}`])
            }

            let quantity = []
            for (let i = 1; i <= 20; i++) {
                if (!data[`strMeasure${i}`] || data[`strMeasure${i}`] == ' ') break;

                quantity.push(data[`strMeasure${i}`])
            }
            const result = replaceCardDetails(data, ingredient, quantity, Instructions);
            response.end(result)

        })
    }

})
server.listen(8080)

const getJson = async function (url) {
    const res = await fetch(url);
    if (!res.ok) return
    return res.json()
}