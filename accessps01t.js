const puppeteer = require('puppeteer'); //bot
const fs = require('fs'); //files
const table = require('table'); //make table


(async () => {
  //launches bot and opens up powerschool
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://ps001.bergen.org/public/home.html');


  /* LOGGING IN */
 // const login =fs.readFileSync('login.txt','utf8').split("\r\n");
  var login = process.argv.slice(2);
  var count = 0;
  //Attempt to log in repeatedly till successful
  while ((await page.$$('#fieldAccount')).length!=0){
    if(count>15) process.exit(0);
    //enters log in info
    await page.type('#fieldAccount', login[0], {     delay:30    })
    await page.type('#fieldPassword', login[1], {    delay: 30   })

    // click sign in button
    await page.click('#btn-enter');
    await page.waitForNavigation({  waitUnitl: 'networkidle0    '});
    count++;
}

  //go to grades
  await page.goto('https://ps001.bergen.org/guardian/home.html');
/*
  await page.setViewport({
    width: 1350,
    height: 625,
    deviceScaleFactor: 1,
  });


  //make image directory and save screenshot there.
  fs.mkdir('images', (err)=>{});
  await page.screenshot({path: 'images/gradesnattend.png'});
*/

  // evaluates function and set it into result
  //Gets a 2d array of the grades table
  const result = await page.evaluate(() => {
    const rows = document.querySelectorAll('table tr');   // querySelectorAll takes content out of the selector
    return Array.from(rows, row => {
      const columns = row.querySelectorAll('td');
      return Array.from(columns, column => column.innerText)
      });
    });

  let tab = new Array(result.length+1);

  //retrieve important parts of grades
for(i=0;i<tab.length;i++){
  tab[i]=new Array(4);
}
tab[0][0]="Course";
tab[0][1]="Tri 1";
tab[0][2]="Tri 2";
tab[0][3]="Tri 3";
var j=1;

  //gets important parts from results
  for(i=1;i<result.length-2;i++){

    if(result[i][11]!= null){
    var name = result[i][11];
    var tri1 = result[i][12];
    var tri2 = result[i][13];
    var tri3 = result[i][14];



    if(tri1.includes("\n") || tri2.includes("\n") || tri3.includes("\n")){  //makes sure class exists/has grades
      tab[j][0]=name.split("\n")[0]; //only gets name of class
      tab[j][1]=tri1;
      tab[j][2]=tri2;
      tab[j][3]=tri3;
      j++;
    }
  }
}

  //loop removes trailing nulls
  var bool=true;
  while(bool){
    if(tab[tab.length-1][0]==null){
      tab.pop();
    }
    else{
      bool=!bool;
    }
  }


  //write results into file
  fs.mkdir('scraped_data', (err)=>{});
  fs.writeFile('scraped_data/grades.txt', table.table(tab), (err)=>{});


  await browser.close();
})();