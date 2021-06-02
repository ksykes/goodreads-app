context.Response.ContentType = "application/json";

string bookTitle = context.Request.QueryString["bookTitle"];
string bookAuthor = context.Request.QueryString["bookAuthor"];

public string GetGoodreadsURI(string bookAuthor, string bookTitle) {
    string myKey = keyManager.GetConfigurationByKey("goodreadsDeveloperKey");
    string uri = "http://www.goodreads.com/book/title?format={0}&author={1}&key={3}";
    return String.Format(uri, "xml", bookAuthor, myKey, bookTitle);

    string bookTitle = context.Request.QueryString["bookTitle"];
    string bookAuthor = context.Request.QueryString["bookAuthor"];
    string uri = GetGoodreadsURI(bookAuthor, bookTitle);
}

public string GetResponseFromAPI (string uri, out int serverStatus) {
    string responseData = String.Empty;
    try {
        HttpWebRequest req = (HttpWebRequest)WebRequest.Create(uri);
        HttpWebResponse res = (HttpWebResponse)req.GetResponse();
        serverStatus = (int)res.StatusCode;

        using (Stream s = res.GetResponseStream()) {
            using (StreamReader sr = new StreamReader(s)) {
                responseData = sr.ReadToEnd();
            }
        }
    return responseData;
    }
catch (WebException e) {
    HttpWebResponse res = (HttpWebResponse)e.Response;
    serverStatus = (int)res.StatusCode;
    return responseData;
}
}