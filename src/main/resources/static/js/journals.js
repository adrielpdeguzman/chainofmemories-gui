var journal_url = API_URL + "journals/";

class JournalEntry extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      journal: [],
      user: []
    }
  }
  componentDidMount() {
    let id = document.getElementById('react').dataset.journalId;
    $.ajax({
      url: journal_url + id,
      success: function(data) {
        console.log(data);
        this.setState({ journal: data, user: data.user });
      }.bind(this),
    })
  }
  render() {
    return (
      <div className="journal panel panel-default">
        <div className="panel-heading text-uppercase">
          <h1 className="panel-title">
            Vol. {this.state.journal.volume} Day {this.state.journal.day} | {this.state.journal.publishDate}
          </h1>
          <hr/>
          <h2 className="panel-title">
            Posted by: {this.state.user.firstName} {this.state.user.lastName}
          </h2>
        </div>
        <div className="panel-body">
          {this.state.journal.contents}
        </div>
        <ul className="list-group">
          <li className="list-group-item">{this.state.journal.specialEvents}</li>
        </ul>
      </div>
    );
  }
}

ReactDOM.render(
  <JournalEntry />,
  document.getElementById('react')
);