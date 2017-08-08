import React, { Component } from "react";
import "./App.css";
import $ from "jquery";
import * as rbs from "react-bootstrap";

//insert the token here
let global_token = "";

class App extends Component {
  render() {
    return (
      <div>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css" />
        <ContactList />
      </div>
    );
  }
}

class ContactList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contact_data: [],
      selected_contact: {}
    }
    this.select_contact = this.select_contact.bind(this);
  }

  componentWillMount() {
    return $.ajax({
        url: "https://stage.skipio.com/api/v2/contacts?token=" + global_token + "&page=1&per=100",
        type: "GET",
        dataType: "json"
    })
    .done( (response) => {
      this.setState({contact_data: response.data});
    })
    .fail( (response) => {
        alert("Error: failed to retrieve contact list.");
    })
  }

  select_contact(contact, index) {
    this.setState({selected_index: index, selected_contact: contact});
  }

  render() {
    let contacts = this.state.contact_data;

    return (
      <rbs.Grid id="main_grid">
        <h2>Contacts</h2>
        {contacts.map((contact, index) => {
          let selected = false;
          if (this.state.selected_index !== undefined && this.state.selected_index === index)
            selected = true;
          return (
            <div className="contact" key={contact.id}>
              <rbs.Row>
                <rbs.Col xs={12}>
                  <ContactView index={index} contact={contact} onClick={this.select_contact} selected={selected}/>
                </rbs.Col>
              </rbs.Row>
            </div>
          );
        })}
        <rbs.Row id="messager">
          <rbs.Col xs={12}>
            <Messager contact={this.state.selected_contact} />
          </rbs.Col>
        </rbs.Row>
      </rbs.Grid>
    );
  }
}

class ContactView extends Component {
  constructor(props) {
    super(props);
    this.handle_click = this.handle_click.bind(this);
  }

  handle_click() {
    this.props.onClick(this.props.contact, this.props.index);
  }

  render() {
    let contact = this.props.contact;
    let button_style = this.props.selected ? "primary" : "default";
    return (
      <rbs.Button bsStyle={button_style} block onClick={this.handle_click}>
        <table>
          <thead>
            <tr>
              <th className="contact_table">Name</th>
              <th className="contact_table">Email</th>
              <th className="contact_table">Phone</th>    
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="contact_table">{contact.full_name}</td>
              <td className="contact_table">{contact.email}</td>
              <td className="contact_table">{contact.phone_mobile}</td>
            </tr>
          </tbody>
        </table>
      </rbs.Button>
    );
  }
}

class Messager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message_text: ""
    };
    this.send_message = this.send_message.bind(this);
    this.handle_text_change = this.handle_text_change.bind(this);
  }

  handle_text_change(e) {
    this.setState({message_text: e.target.value})
  }

  send_message(e) {
    let recipient = "contact-" + this.props.contact.id;
    let data = {
      recipients: [
        recipient
      ],
      message: {
        body: this.state.message_text
      }
    };

    this.setState({message_text: ""});

    return $.ajax({
        url: "https://stage.skipio.com/api/v2/messages?token=" + global_token,
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: "text"
    })
    .done(function() {
      alert("Success: message sent.");
    })
    .fail(function() {
      alert("Error: couldn't send message.");
    })
  }

  render() {
    if ($.isEmptyObject(this.props.contact)) {
      return <div></div>;
    }
    
    return (
      <div>
        <rbs.FormGroup controlId="formControlsTextarea">
          <rbs.ControlLabel>{this.props.contact.full_name}</rbs.ControlLabel>
          <rbs.FormControl onChange={this.handle_text_change} value={this.state.message_text} componentClass="textarea" />
        </rbs.FormGroup>
        <rbs.Button bsStyle="success" onClick={this.send_message}>Send SMS</rbs.Button>
      </div>
    );
  }
}

export default App;
