import React from "react";
import { render } from "react-dom";
import { slideDown, slideUp } from "./anim";
import "./style.css";
import OrderData from "./data";

function capitalize(str) {
  return str
    .split(" ")
    .map(s => {
      return s.charAt(0).toUpperCase() + s.substr(1);
    })
    .join(" ");
}

class OrderTableRow extends React.Component {
  state = { expanded: false };

  toggleExpander = e => {
    if (e.target.type === "checkbox") return;

    if (!this.state.expanded) {
      this.setState({ expanded: true }, () => {
        if (this.refs.expanderBody) {
          slideDown(this.refs.expanderBody);
        }
      });
    } else {
      slideUp(this.refs.expanderBody, {
        onComplete: () => {
          this.setState({ expanded: false });
        }
      });
    }
  };

  render() {
    const { order } = this.props;

    let servOptMap = new Map([
      ["STD", "Standard"],
      ["URG", "Urgente"],
      ["TS", "Fascia Oraria"]
    ]);
    let ordStatMap = new Map([
      ["CREATED", "Creato"],
      ["IN_TRANSIT", "In transito"],
      ["COMPLETED", "Completato"]
    ]);

    var creationDate = new Date(order.createdAt);
    var deliveryDate = new Date(order.serviceOption.deliveryDatetime);
    var deliveryDateBegin = new Date(deliveryDate.getTime());
    deliveryDateBegin.setHours(
      deliveryDateBegin.getHours() - order.serviceOption.width
    );

    return [
      <tr key="main" onClick={this.toggleExpander}>
        <td className="uk-text-nowrap">{this.props.index}.</td>
        <td>
          {creationDate.getDate() +
            "/" +
            (creationDate.getMonth() + 1) +
            "/" +
            creationDate.getFullYear() +
            " " +
            creationDate.toLocaleTimeString(["it-IT"], {
              hour: "2-digit",
              minute: "2-digit"
            })}
        </td>
        <td>
          {capitalize(order.receiver.name + " " + order.receiver.surname)}
        </td>
        <td>{servOptMap.get(order.serviceOption.type)}</td>
        <td>
          {deliveryDate.getDate() +
            "/" +
            (deliveryDate.getMonth() + 1) +
            "/" +
            deliveryDate.getFullYear()}
          <br />
          <small>
            {deliveryDateBegin.toLocaleTimeString(["it-IT"], {
              hour: "2-digit",
              minute: "2-digit"
            }) +
              " - " +
              deliveryDate.toLocaleTimeString(["it-IT"], {
                hour: "2-digit",
                minute: "2-digit"
              })}
          </small>
        </td>
        <td>
          {ordStatMap.get(
            order.trackingHistory[order.trackingHistory.length - 1].status
          )}
        </td>
      </tr>,
      this.state.expanded && (
        <tr className="expandable" key="tr-expander">
          <td className="uk-background-muted" colSpan={6}>
            <div ref="expanderBody" className="inner uk-grid">
              <div className="uk-width-1-2">
                <p>
                  Codice tracking
                  <br />
                  {order.trackingNumber}
                </p>
                <p>
                  Costo consegna
                  <br />
                  {order.serviceOption.price + "€"}
                </p>
                <p>
                  <small>Dati pacco</small>
                  <br />
                  Dimensioni: {order.packages[0].dimension.height} x{" "}
                  {order.packages[0].dimension.width} x{" "}
                  {order.packages[0].dimension.depth} cm
                  <br />
                  Peso: {order.packages[0].weight} kg
                  {order.packages[0].permeable ? (
                    <span>
                      <br />
                      Sensibile all'acqua
                    </span>
                  ) : (
                    ""
                  )}
                  {order.packages[0].unflippable ? (
                    <span>
                      <br />
                      Non ribaltabile
                    </span>
                  ) : (
                    ""
                  )}
                  {order.packages[0].unstackable ? (
                    <span>
                      <br />
                      Non impilabile
                    </span>
                  ) : (
                    ""
                  )}
                  {order.packages[0].fragile ? (
                    <span>
                      <br />
                      Fragile
                    </span>
                  ) : (
                    ""
                  )}
                </p>
                {order.packages[0].note.length > 0 ? (
                  <p>
                    Note
                    <br />
                    <i>{order.packages[0].note}</i>
                  </p>
                ) : (
                  ""
                )}
              </div>
              <div className="uk-width-1-2">
                <p>
                  Destinatario
                  <br />
                  <i>
                    {capitalize(
                      order.receiver.name + " " + order.receiver.surname
                    )}
                  </i>
                </p>
                <p>
                  Indirizzo
                  <br />
                  <i>{capitalize(order.receiver.address.description)}</i>
                </p>
                <p>
                  Email
                  <br />
                  <i>{order.receiver.email}</i>
                </p>
                <p>
                  Telefono
                  <br />
                  {order.receiver.phoneNumber}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )
    ];
  }
}

class App extends React.Component {
  state = { users: null };

  componentDidMount() {
    fetch("https://randomuser.me/api/1.1/?results=15")
      .then(response => response.json())
      .then(data => {
        console.log("data fetched: [unused]");
        console.log(data);
        console.log("loading data from file to app state: [unused]");
        console.log(OrderData);
        this.setState({ orders: OrderData.data });
      });
  }

  render() {
    //const { orders } = this.state;
    const orders = this.state.orders;
    console.log("orders in app state: [unused]");
    console.log(orders);

    const orders2 = OrderData.data;
    console.log("orders2: [currently used]");
    console.log(orders2);

    const isLoading = orders2 === null;
    return (
      <main>
        <div className="table-container">
          <div className="uk-overflow-auto">
            <table className="uk-table uk-table-hover uk-table-middle uk-table-divider">
              <thead>
                <tr>
                  <th className="uk-table-shrink" />
                  <th>DATA CREAZIONE</th>
                  <th>DESTINATARIO</th>
                  <th>TIPO DI CONSEGNA</th>
                  <th>FASCIA DI CONSEGNA</th>
                  <th className="uk-table-shrink">STATO</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="uk-text-center">
                      <em className="uk-text-muted">Loading...</em>
                    </td>
                  </tr>
                ) : (
                  orders2.map((order, index) => (
                    <OrderTableRow
                      key={index}
                      index={index + 1}
                      order={order}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    );
  }
}

render(<App />, document.getElementById("root"));
