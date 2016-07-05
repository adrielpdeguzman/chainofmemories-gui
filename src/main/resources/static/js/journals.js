const BASE_URL = API_URL + "journals/";
const URL = {
  findByVolume            : "search/findByVolume?v={0}",
  getVolumesWithStartDate : "search/getVolumesWithStartDate",
  getDatesWithoutEntry    : "search/getDatesWithoutEntry",
  findByContentsAndVolume : "search/findByContentsAndVolume?q={0}&v={1}",
  findByContents          : "search/findByContents?q={0}",
  findRandom              : "search/findRandom",
};
const initialVolume = document.getElementById("react").dataset.volume;
Object.keys(URL).forEach(function (key) {
  URL[key] = BASE_URL + URL[key];
});

function splitNewLineAndEncloseWithTagWithClass(input, tag, cssClass = null) {
  if (input == null || input == "") {
    return null;
  }
  let lines;
  input = input.split(/\r?\n/).filter(Boolean);

  switch(tag) {
    case "li":
      lines = input.map(
        line => <li className={cssClass}>{line}</li>
      );
      break;
    case "div":
      lines = input.map(
        line => <div className={cssClass}>{line}</div>
      );
      break;
    case "p":
      lines = input.map(
        line => <p className={cssClass}>{line}</p>
      );
      break;
    case "span":
      lines = input.map(
        line => <span className={cssClass}>{line}</span>
      );
      break;
    default:
      lines = input.map(
        line => {line}
      );
  }
  return lines;
}

function throwForbiddenError(xhr, ajaxOptions, thrownError) {
  window.location = window.location.pathname + "/login";
}

class App extends React.Component {

  constructor(props) {
		super(props);
		this.state = {
		  volume: initialVolume, principal: "",
		  journals: [], journal: [],
		  datesWithoutEntry: [], volumesWithStartDate: [],
		  isSearchActive: false
		};

    this.handleUpdateDialogShow = this.handleUpdateDialogShow.bind(this);
		this.handleRandomDialogShow = this.handleRandomDialogShow.bind(this);
    this.handleJournalCreate = this.handleJournalCreate.bind(this);
    this.handleJournalUpdate = this.handleJournalUpdate.bind(this);
		this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
		this.handleVolumeChange = this.handleVolumeChange.bind(this);
		this.handleSearchChange = this.handleSearchChange.bind(this);
	}

  handleUpdateDialogShow(journal) {
    this.setState({ journal: journal });
  }

	handleVolumeChange(volume) {
	  this.setState({
	    volume: volume
	  }, function() {
      this.loadJournalsByVolume();
      this.loadPrincipal();
      updateURL(volume);
    });
	}

	handleJournalCreate(journal) {
	  $.ajax({
      url: BASE_URL,
      dataType: "json",
      contentType: "application/json",
      type: "POST",
      data: JSON.stringify(journal),
      success: function(data) {
        $("#create-dialog").modal("hide");
        this.loadJournalsByVolume();
        this.loadDatesWithoutEntry();
        this.loadVolumesWithStartDate();
      }.bind(this)
    });
	}

	handleJournalUpdate(journal) {
    $.ajax({
      url: this.state.journal._links.self.href,
      dataType: "json",
      contentType: "application/json",
      type: "PATCH",
      data: JSON.stringify(journal),
      success: function(data) {
        $("#update-dialog").modal("hide");
        this.loadJournalsByVolume();
      }.bind(this)
    });
  }

  handleSearchSubmit(searchQuery) {
    let searchURL;

    if (searchQuery.v == 0) {
      searchURL = URL.findByContents.format(searchQuery.q);
    } else {
      searchURL = URL.findByContentsAndVolume.format(searchQuery.q, searchQuery.v);
    }

    $.ajax({
      url: searchURL,
      success: function(data) {
        this.setState({ journals: data._embedded.journals, isSearchActive: true });
      }.bind(this)
    });
  }

  handleRandomDialogShow() {
      $.ajax({
        url: URL.findRandom,
        success: function(data) {
          this.setState({ journal: data });
        }.bind(this)
      });
    }

  handleSearchChange() {
    this.setState({
      isSearchActive: !this.state.isSearchActive,
      journals: []
    });
    if (this.state.isSearchActive) {
      this.loadJournalsByVolume();
    }
  }

  loadVolumesWithStartDate() {
    $.ajax({
      url: URL.getVolumesWithStartDate,
      success: function(data) {
        this.setState({ volumesWithStartDate: data });
      }.bind(this),
      error: function (xhr, ajaxOptions, thrownError) {
        if (xhr.status==403) {
          throwForbiddenError(xhr, ajaxOptions, thrownError);
        }
      }
    });
  }

  loadDatesWithoutEntry()  {
    $.ajax({
      url: URL.getDatesWithoutEntry,
      success: function(data) {
        this.setState({ datesWithoutEntry: data });
      }.bind(this),
      error: function (xhr, ajaxOptions, thrownError) {
        if (xhr.status==403) {
          throwForbiddenError(xhr, ajaxOptions, thrownError);
        }
      }
    });
  }

	loadJournalsByVolume() {
	  $.ajax({
      url: URL.findByVolume.format(this.state.volume),
      success: function(data) {
        this.setState({ journals: data._embedded.journals });
      }.bind(this),
      error: function (xhr, ajaxOptions, thrownError) {
        if (xhr.status==403) {
          throwForbiddenError(xhr, ajaxOptions, thrownError);
        }
      }
    });
	}

	loadPrincipal() {
	  $.ajax({
      url: API_URL + "me",
      success: function(data) {
        this.setState({ principal: data.name });
      }.bind(this),
      error: function (xhr, ajaxOptions, thrownError) {
        if (xhr.status==403) {
          throwForbiddenError(xhr, ajaxOptions, thrownError);
        }
      }
    });
	}

	componentDidMount() {
    this.loadDatesWithoutEntry();
    this.loadJournalsByVolume();
    this.loadPrincipal();
    this.loadVolumesWithStartDate();
	}

  render() {
    let hidden = "";
    let shown = "hidden";
    let navigationComponent = null;
    let specialEventsListComponent = null;
    let searchComponent = null;

    if (this.state.isSearchActive) {
      hidden = "hidden";
      shown = ""
      searchComponent = <Search
                          volumesWithStartDate={this.state.volumesWithStartDate}
                          onSearchSubmit={this.handleSearchSubmit}
                          handleSearchChange={this.handleSearchChange} />
    } else {
      navigationComponent = <Navigation journals={this.state.journals}
                              onVolumeChange={this.handleVolumeChange}
                              volumesWithStartDate={this.state.volumesWithStartDate}
                              volume={this.state.volume} />;
      specialEventsListComponent = <SpecialEventsList journals={this.state.journals} />;
    }

    return (
      <div>
        <div className="row">
          <div className="col-md-3">
            <div className="panel panel-default">
              <div className={"panel-heading " + hidden}>
                <div className="btn-group btn-group-justified" role="group">
                  <div className="btn-group" role="group">
                    <button type="button" className="btn btn-primary" data-toggle="modal"
                      data-target="#create-dialog" disabled={this.state.datesWithoutEntry.length == 0}>
                    <span className="glyphicon glyphicon-pencil"></span></button>
                  </div>
                  <div className="btn-group" role="group">
                    <button className="btn btn-default" onClick={this
                    .handleRandomDialogShow}
                      data-toggle="modal" data-target="#random-dialog">
                    <span className="glyphicon glyphicon-asterisk"></span></button>
                  </div>
                  <div className="btn-group" role="group">
                    <button className="btn btn-default" onClick={this.handleSearchChange}>
                    <span className="glyphicon glyphicon-search"></span></button>
                  </div>
                </div>
              </div>

              <div className="panel-body">
                {searchComponent}
                {navigationComponent}
              </div>

              <div className={"panel-footer " + shown}>
                <button className="form-control btn btn-default" onClick={this.handleSearchChange}>
                Cancel Search</button>
              </div>
            </div>
          </div>
          <div className="col-md-9">
            <JournalList
              journals={this.state.journals}
              onJournalUpdate={this.handleUpdateDialogShow}
              principal={this.state.principal}
              isSearchActive={this.state.isSearchActive} />
            {specialEventsListComponent}
          </div>
        </div>
        <CreateDialog
          onJournalCreate={this.handleJournalCreate}
          datesWithoutEntry={this.state.datesWithoutEntry} />
        <UpdateDialog
          onJournalUpdate={this.handleJournalUpdate}
          journal={this.state.journal} />
        <RandomDialog journal={this.state.journal} />
      </div>
    )
  }
}

class Navigation extends React.Component {

  constructor(props) {
    super(props);

    this.handleVolumeChange = this.handleVolumeChange.bind(this);
  }

  handleVolumeChange(e) {
    this.props.onVolumeChange(e.target.value);
  }

  render() {
    let volumes = this.props.volumesWithStartDate.map(function(volume) {
      return <option value={volume.volume}>Volume {volume.volume} {volume.publishDate}</option>
    });
    let previousDay = 0;
    let links = this.props.journals.map(function(link) {
      if (link.day == previousDay) {
        return;
      } else {
        previousDay = link.day;
        return <li><a href={"#" + link.day + "-" + link.user.firstName}>Day {link.day} | {link.publishDate}</a></li>;
      }
    });

    return (
      <div>
        <select name="volume" className="form-control" onChange={this.handleVolumeChange}
        value={this.props.volume}>
          {volumes}
        </select>
        <div className="vertical-spacer"></div>
        <ul className="list-unstyled">
          {links}
          <li><a href="#outline">Special Events Outline</a></li>
        </ul>
      </div>
    )
  }

}

class Search extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      query: "",
      volume: 0
    };

    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
  }

  handleVolumeChange(e) {
    this.setState({ volume: e.target.value });
  }

  handleQueryChange(e) {
    this.setState({ query: e.target.value });
  }

  handleSearchChange(e) {
    e.preventDefault();
    this.setState({ query: "", volume: 0 });
    this.props.handleSearchChange();
  }

  handleSearchSubmit(e) {
    e.preventDefault();
    let searchQuery = {};
    searchQuery.q = this.state.query;
    searchQuery.v = this.state.volume;
    this.props.onSearchSubmit(searchQuery);
    $("input[name='query']").focus();
  }

  render() {
    let volumes = this.props.volumesWithStartDate.map(volume =>
      <option value={volume.volume}>Volume {volume.volume} {volume.publishDate}</option>
    );

    return (
      <div>
        <form onSubmit={this.handleSearchSubmit}>
          <div className="input-group">
            <input type="text" className="form-control" name="query" value={this.state.query}
              onChange={this.handleQueryChange} placeholder="Search..."/>
              <span className="input-group-btn">
                <button className="btn btn-primary" onClick={this.handleSearchSubmit}>
                <span className="glyphicon glyphicon-search"></span></button>
              </span>
          </div>
          <div className="vertical-spacer"></div>
          <select name="volume" className="form-control" value={this.state.volume} onChange={this.handleVolumeChange}>
            <option value="0">All Volumes</option>
            {volumes}
          </select>
          <div className="vertical-spacer"></div>
        </form>
      </div>
    )
  }

}

class JournalList extends React.Component {

  constructor(props) {
		super(props);
	}

  render() {
    let journals = this.props.journals.map(journal =>
      <Journal
        key={journal._links.self.href}
        journal={journal}
        onJournalUpdate={this.props.onJournalUpdate}
        principal={this.props.principal}
        isSearchActive={this.props.isSearchActive} />
    );

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

		this.handleModalShow = this.handleModalShow.bind(this);
	}

	handleModalShow() {
    this.props.onJournalUpdate(this.props.journal);
	}

  render() {
    let events = splitNewLineAndEncloseWithTagWithClass(this.props.journal.specialEvents, "li");
    let contents = splitNewLineAndEncloseWithTagWithClass(this.props.journal.contents, "p");
    let updateButton = null;
    if (this.props.principal == this.props.journal.user.username && !this.props.isSearchActive) {
      updateButton = <button onClick={this.handleModalShow} className="btn btn-default pull-right"
              data-toggle="modal" data-target="#update-dialog"><span className="glyphicon glyphicon-edit"></span></button>
    }

    return (
      <div>
        <div id={this.props.journal.day + "-" + this.props.journal.user.firstName}
        className="anchor"></div>
        <div className="journal panel panel-default">
          <div className="panel-heading text-uppercase">
            <h4>
              Day {this.props.journal.day} | {this.props.journal.publishDate}
              {updateButton}
            </h4>
            <h5>
              Posted by: {this.props.journal.user.firstName} {this.props.journal.user.lastName}
            </h5>
          </div>
          <div className="panel-body">
            {contents}
          </div>
          <div className={!events ? "hidden" : "panel-footer"}>
            <ul>
              {events}
            </ul>
          </div>
        </div>
      </div>
    )
  }
}

class SpecialEventsList extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    let events = this.props.journals.map(journal =>
      <SpecialEventsItem journal={journal} />
    );

    return (
      <div>
        <div id="outline" className="anchor"></div>
        <div className="panel panel-default">
          <div className="panel-heading text-uppercase">
            <h4>Special Events Outline</h4>
          </div>
          <div className="panel-body">
            {events}
          </div>
        </div>
      </div>
    )
  }
}

class SpecialEventsItem extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    let events = splitNewLineAndEncloseWithTagWithClass(this.props.journal.specialEvents, "li", "");

    return (
      <div className={!this.props.journal.specialEvents ? "hidden" : ""}>
        <p><em>Day {this.props.journal.day} | {this.props.journal.publishDate} by:
          {this.props.journal.user.firstName} {this.props.journal.user.lastName}</em></p>
        <ul>
          {events}
        </ul>
      </div>
    )
  }
}

class CreateDialog extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      publishDate: "",
      contents: "",
      specialEvents: ""
    };

    this.handleContentsChange = this.handleContentsChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleJournalCreate = this.handleJournalCreate.bind(this);
    this.handleSpecialEventsChange = this.handleSpecialEventsChange.bind(this);
  }

  handleDateChange(e) {
    this.setState({ publishDate: e.target.value });
  }

  handleContentsChange(e) {
    this.setState({ contents: e.target.value });
  }

  handleSpecialEventsChange(e) {
    this.setState({ specialEvents: e.target.value });
  }

  handleJournalCreate(e) {
    e.preventDefault();
    let journal = {};
    let contents = this.state.contents.trim();
    let specialEvents = this.state.specialEvents.trim();

    if (!contents) {
      return;
    }

    journal.contents = contents;
    journal.publishDate = this.state.publishDate || this.props.datesWithoutEntry[0];
    journal.specialEvents = specialEvents;

    this.props.onJournalCreate(journal);
    this.setState({ publishDate: "", contents: "", specialEvents: "" });
  }

  componentDidMount() {
    $("#create-dialog").on("shown.bs.modal", function(e) {
      $("#create-dialog textarea[name='contents']").focus();
    });
  }

  render() {
    let dates = this.props.datesWithoutEntry.map(date =>
      <option value={date}>{date}</option>
    );

    return (
      <div>
        <div className="modal fade" id="create-dialog" tabindex="-1" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span></button>
                <h4 className="modal-title">Create New Journal Entry</h4>
              </div>

              <div className="modal-body">
                <form>
                  <label htmlFor="publishDate">Publish Date</label>
                  <select name="publishDate" className="form-control" onChange={this.handleDateChange}
                   value={this.state.publishDate}>
                    {dates}
                  </select>
                  <div class="form-group">
                    <label htmlFor="contents">Journal Contents</label>
                    <textarea className="form-control" id="contents" name="contents" rows="10"
                     cols="100" required="required" onChange={this.handleContentsChange}
                     value={this.state.contents}></textarea>
                  </div>
                  <div class="form-group">
                    <label htmlFor="specialEvents">Special Events</label>
                    <textarea className="form-control" id="specialEvents" name="specialEvents" rows="4"
                     cols="100" onChange={this.handleSpecialEventsChange}
                     value={this.state.specialEvents}></textarea>
                  </div>
                </form>
              </div>

              <div className="modal-footer">
                <input type="submit" onClick={this.handleJournalCreate} className="btn btn-primary"
                disabled={!this.state.contents} value="Create Journal Entry"/>
                <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class UpdateDialog extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      contents: "",
      specialEvents: ""
    };

    this.handleContentsChange = this.handleContentsChange.bind(this);
    this.handleJournalUpdate = this.handleJournalUpdate.bind(this);
    this.handleSpecialEventsChange = this.handleSpecialEventsChange.bind(this);
  }

  handleContentsChange(e) {
    this.setState({ contents: e.target.value });
  }

  handleSpecialEventsChange(e) {
    this.setState({ specialEvents: e.target.value });
  }

  handleJournalUpdate(e) {
    e.preventDefault();
    let journal = {};
    let contents = this.state.contents.trim();
    let specialEvents = this.state.specialEvents.trim();
    if (!contents) {
      return;
    }

    journal.contents = contents;
    journal.specialEvents = specialEvents;

    this.props.onJournalUpdate(journal);
    this.setState({ contents: "", specialEvents: "" });
  }

  componentDidMount() {
    $("#update-dialog").on("shown.bs.modal", function(e) {
      $("#update-dialog textarea[name='contents']").focus();
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      contents: nextProps.journal.contents,
      specialEvents: nextProps.journal.specialEvents
    });
  }

  render() {
    return (
      <div>
        <div className="modal fade" id="update-dialog" tabindex="-1" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span></button>
                <h4 className="modal-title">Day {this.props.journal.day} | {this.props.journal.publishDate}</h4>
              </div>

              <div className="modal-body">
                <form>
                  <div class="form-group">
                    <label htmlFor="contents">Journal Contents</label>
                    <textarea className="form-control" id="contents" name="contents" rows="10"
                     cols="100" required="required" onChange={this.handleContentsChange}
                     value={this.state.contents}></textarea>
                  </div>
                  <div class="form-group">
                    <label htmlFor="specialEvents">Special Events</label>
                    <textarea className="form-control" id="specialEvents" name="specialEvents" rows="4"
                     cols="100" onChange={this.handleSpecialEventsChange}
                     value={this.state.specialEvents}></textarea>
                  </div>
                </form>
              </div>

              <div className="modal-footer">
                <input type="submit" onClick={this.handleJournalUpdate} className="btn btn-primary"
                disabled={!this.state.contents} value="Update Journal Entry"/>
                <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class RandomDialog extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $("#random-dialog").on("shown.bs.modal", function(e) {
      $("#random-dialog button").focus();
    });
  }

  render() {
    let contents = splitNewLineAndEncloseWithTagWithClass(this.props.journal.contents, "p");
    let events = splitNewLineAndEncloseWithTagWithClass(this.props.journal.specialEvents, "li");

    return (
      <div>
        <div className="modal fade" id="random-dialog" tabindex="-1" role="dialog">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span></button>
                <h4 className="modal-title">
                  Vol. {this.props.journal.volume} Day {this.props.journal.day} | {this.props.journal.publishDate}
                  {!this.props.journal.user ? null : <span> by: {this.props.journal.user.firstName} {this.props.journal.user.lastName}</span> }
                </h4>
              </div>

              <div className="modal-body">
                {contents}
                <hr/>
                <ul>
                  {events}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById("react")
);
