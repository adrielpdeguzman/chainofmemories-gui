var JournalBox = React.createClass({
  render: function() {
    return (
      <div className="journal panel panel-default">
        <div className="panel-heading text-uppercase">
          <h1 className="panel-title">
            Vol. {this.props.journal.volume} Day {this.props.journal.day} | {this.props.journal.publishDate}
          </h1>
          <hr/>
          <h2 className="panel-title">
            Posted by: {this.props.journal.user.firstName} {this.props.journal.user.lastName}
          </h2>
        </div>
        <div className="panel-body">
          {this.props.journal.contents}
        </div>
        <ul className="list-group">
          <li className="list-group-item">{this.props.journal.specialEvents}</li>
        </ul>
      </div>
    );
  }
});

var Journal = {
        publishDate: '2013-12-07',
        volume: 1,
        day: 1,
        contents: 'Lorem ipsum dolor',
        specialEvents: 'Lorem ipsum dolor',
        user: {firstName: 'Adriel', lastName: 'de Guzman'}
};

ReactDOM.render(
  <JournalBox journal={Journal} />,
  document.getElementById('react')
);