$(document).ready(function(){



    $("#sendBtn").click(function(){


        var pergunta = $("#msgInput").val();


        //const axios = require("axios");

const config = {
  headers: {
    "x-api-key": "sec_oNSB8e6u0ii7J5jpRILoMFgGYMdIiksM",
    "Content-Type": "application/json",
  },
};

const data = {
  sourceId: "src_QfPWzMsoCQigRNepgI7iQ",
  messages: [
    {
      role: "user",
      content: pergunta,
    },
  ],
};

axios
  .post("https://api.chatpdf.com/v1/chats/message", data, config)
  .then((response) => {
    console.log("Result:", response.data.content);
  })
  .catch((error) => {
    console.error("Error:", error.message);
    console.log("Response:", error.response.data);
  });



  /*
        $.ajax({
            url: "https://api.chatpdf.com/v1/chats/message", // The URL to send the request to
            type: "POST",     // The HTTP method (GET, POST, etc.)
            headers : {
    'x-api-key': 'sec_oNSB8e6u0ii7J5jpRILoMFgGYMdIiksM',
    "Content-Type": "application/json",
},
  data: {           // Data to send to the server
    'sourceId': "src_QfPWzMsoCQigRNepgI7iQ",
    'messages': [
        {
            'role': "user",
            'content': pergunta,
        }
    ]
  },
  success: function(response) { // Callback function on successful request
    $("#result").html(response); // Update an HTML element with the response
    alert(response);
  },
  error: function(xhr, status, error) { // Callback function on error
    console.error("AJAX Error:", status, error);
  }
});

*/
    });

    

});