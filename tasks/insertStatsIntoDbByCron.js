const cron = require("node-cron");
const insertAnalyticsViewIntoDb = require("../functions/cron_Jobs/insertAnalyticsViewIntoDb");
const insertAdminAnalticsIntoDb =
  require("../functions/cron_Jobs/insertAdminAnalticsIntoDb").insertAdminAnalticsIntoDb;
const purchaseAnalyticsinsert = require("../functions/cron_Jobs/purchaseAnalyticsinsert");
const orderAnytiycsInser = require("../functions/cron_Jobs/orderAnytiycsInser");
// '0 * * * *' تعني عند الدقيقة 0 من كل ساعة
cron.schedule("0 * * * *", () => {
  insertAnalyticsViewIntoDb();
});

// generic Analytics like users, order revenue , etc....
cron.schedule("0 * * * *", () => {
  insertAdminAnalticsIntoDb();

  /* logic and lifeCycle  for cron to insert Analytics into db
1- create parent manualy 
2- take names (unique) of parents
3- before create day Analytics 
  - i must have mounthId and mounthId must have parentId
  - to get mounthId => if there aren't monthCreatedAt in db has current mounth ? got to next step to create it 
  - but before create i mush have parentId  
4- we make task Dispatcher ( like  if/else but dispatcher more clean)
5- insert dayAnalutics  by task dispatcher  
*/
});
// order & cart product
cron.schedule("0 * * * *", () => {
  purchaseAnalyticsinsert();
  orderAnytiycsInser();
});
