const JOURNAL_URL = API_URL + "journals/";
const FINDBYVOLUME_URL = JOURNAL_URL + 'search/findByVolume?v={0}';
var initialVolume = document.getElementById('react').dataset.volume;

class App extends React.Component {

  constructor(props) {
		super(props);
		this.state = {
		  volume: initialVolume,
		  journals: []
		}
	}

	componentDidMount() {
	  console.log(FINDBYVOLUME_URL.format(this.state.volume));
    $.ajax({
      url: FINDBYVOLUME_URL.format(this.state.volume),
      success: function(data) {
        console.log(data._embedded);
        this.setState({ journals: data._embedded.journals });
      }.bind(this)
    });
	}

  render() {
    return (
      <div>
        <Navigation journals={this.state.journals} volume={this.state.volume} />
        <JournalList journals={this.state.journals} />
        <SpecialEvents journals={this.state.journals} />
      </div>
    )
  }

}

class Navigation extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        Navigation
      </div>
    )
  }

}

class JournalList extends React.Component {

  constructor(props) {
		super(props);
	}

  render() {
    var journals = this.props.journals.map(
      journal => <Journal key={journal._links.self.href} journal={journal} />
    );
    console.log(journals);
    return (
      <div>
        {journals}
      </div>
    )
  }

}

class Journal extends React.Component {

  constructor(props) {
		super(props);
	}

  render() {
    console.log(this.props.journal);
    return (
      <div>
        <div className="journal panel panel-default">
          <div className="panel-heading text-uppercase">
            <h2 className="panel-title">
              Vol. {this.props.journal.volume} Day {this.props.journal.day} | {this.props.journal.publishDate}
            </h2>
            <hr/>
            <h3 className="panel-title">
              Posted by: {this.props.journal.user.firstName} {this.props.journal.user.lastName}
            </h3>
          </div>
          <div className="panel-body">
            {this.props.journal.contents}
          </div>
          <ul className="list-group">
            <li className="list-group-item">{this.props.journal.specialEvents}</li>
          </ul>
        </div>
      </div>
    )
  }
}

class SpecialEvents extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        This is SpecialEvents
      </div>
    )
  }

}

var JOURNALS = {"_embedded":{"journals":[{"user":{"email":"adrielpdeguzman@icloud.com","firstName":"Adriel","lastName":"de Guzman"},"publishDate":"2013-12-07","volume":1,"day":1,"contents":"Test 1","specialEvents":"Lorem ipsum dolor","created":"","modified":"","_links":{"self":{"href":"http://localhost:18080/journals/1"},"journal":{"href":"http://localhost:18080/journals/1"},"journals":{"href":"http://localhost:18080/journals/1/journals"}}},{"user":{"email":"monaliceperez@icloud.com","firstName":"Monalice","lastName":"Perez"},"publishDate":"2013-12-07","volume":1,"day":1,"contents":"Test 3","specialEvents":"Lorem ipsum dolor","created":"","modified":"","_links":{"self":{"href":"http://localhost:18080/journals/3"},"journal":{"href":"http://localhost:18080/journals/3"},"journals":{"href":"http://localhost:18080/journals/3/journals"}}},{"user":{"email":"test@test.test","firstName":"Test","lastName":"Test"},"publishDate":"2016-06-27","volume":1,"day":1,"contents":"Lorem ipsum","specialEvents":"Lorem ipsum","created":{"dayOfYear":179,"dayOfWeek":"MONDAY","month":"JUNE","dayOfMonth":27,"hour":12,"minute":49,"second":21,"nano":130000000,"year":2016,"monthValue":6,"chronology":{"calendarType":"iso8601","id":"ISO"}},"modified":"","_links":{"self":{"href":"http://localhost:18080/journals/7"},"journal":{"href":"http://localhost:18080/journals/7"},"journals":{"href":"http://localhost:18080/journals/7/journals"}}}]},"_links":{"self":{"href":"http://localhost:18080/journals/search/findByVolume?v=1"}}};

ReactDOM.render(
  <App />,
  document.getElementById('react')
);