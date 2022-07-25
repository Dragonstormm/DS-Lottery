import { useState, useEffect } from "react";
import Head from "next/head";
import Web3 from "web3";
import styles from "../styles/Home.module.css";
import "bulma/css/bulma.css";
import lotteryContract from "../blockchain/lottery";

export default function Home() {
  // Read about hooks in react
  const [web3, setWeb3] = useState();
  const [address, setAddress] = useState();
  const [lcContract, setLcContract] = useState();
  const [lotteryPot, setLotteryPot] = useState();
  const [lotteryplayers, setPlayers] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [lotteryHistory, setHistory] = useState([]);
  const [lotteryId, setLotteryId] = useState();

  useEffect(
    () => {
      updateState();
    },
    [
      lcContract /*, lotteryPot, players*/,
    ] /*these are function parameters on change trigger the function*/
  );

  const updateState = () => {
    if (lcContract) getPot();
    if (lcContract) getPlayers();
    if (lcContract) getLotteryId();
  };

  const getPot = async () => {
    // console.log("Get pot called");
    const pot = await lcContract.methods.getBalance().call();
    // console.log(`We are getting ${pot} fron the contract`);
    setLotteryPot(web3.utils.fromWei(pot, "ether"));
  };

  const getPlayers = async () => {
    const players = await lcContract.methods.getPlayers().call();
    setPlayers(players);
  };

  const getHistory = async (id) => {
    setHistory([]);
    for (let i = parseInt(id); i > 0; i--) {
      const winnerAddress = await lcContract.methods.lotteryHistory(i).call();
      const historyObj = {};
      historyObj.id = i;
      historyObj.address = winnerAddress;
      setHistory((lotteryHistory) => [...lotteryHistory, historyObj]);
    }
  };

  const getLotteryId = async () => {
    const id = await lcContract.methods.lotteryId().call();
    setLotteryId(id);
    await getHistory(id);
    console.log(JSON.stringify(lotteryHistory));
  };

  const enterLotteryHandler = async () => {
    setError("");
    setSuccessMsg("");

    try {
      await lcContract.methods.enter().send({
        from: address,
        value: "15000000000000000",
        gas: 300000,
        gasPrice: null,
      });
      updateState();
    } catch (err) {
      setError(err.message);
    }
  };
  const pickWinnerHandler = async () => {
    setError("");
    setSuccessMsg("");
    try {
      await lcContract.methods.pickWinner().send({
        from: address,
        // value: "2000000000000000",
        gas: 300000,
        gasPrice: null,
      });
      setSuccessMsg(`Admin is picking a Winner...`);
      updateState();
    } catch (err) {
      setError(err.message);
    }
  };

  const payWinnerHandler = async () => {
    setError("");
    setSuccessMsg("");
    try {
      await lcContract.methods.payWinner().send({
        from: address,
        // value: "2000000000000000",
        gas: 300000,
        gasPrice: null,
      });
      const winnerAdd = await lcContract.methods
        .lotteryHistory(lotteryId)
        .call();
      setSuccessMsg(
        `The winner is ${winnerAdd} and make sure to transfer some amount to the owner of the website otherwise you know what will hapen....`
      );
      updateState();
    } catch (err) {
      setError(err.message);
    }
  };

  const connectWalletHandler = async () => {
    //Checking whethr metamask is installed
    setError("");
    setSuccessMsg("");
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      try {
        setError("");
        await window.ethereum.request({ method: "eth_requestAccounts" });
        // Creating web3 instance and setting it to state
        const web3 = new Web3(window.ethereum);
        // Set web3 instance in react state
        setWeb3(web3);
        // get list of accounts
        const accounts = await web3.eth.getAccounts();
        console.log("It is Connected buddy");
        // Set account 1 to react state
        setAddress(accounts[0]);

        // console.log(`Our call is returning : ${accounts}`);
        // console.log(`Address is : ${address}`);
        // creating a local contract
        const lc = lotteryContract(web3);
        setLcContract(lc);

        window.ethereum.on("accountChanged", async () => {
          const accounts = await web3.eth.getAccounts();
          console.log("It is Connected buddy");
          // Set account 1 to react state
          setAddress(accounts[0]);
        });
      } catch (err) {
        setError(err.message);
      }
    } else {
      console.log("Please install Metamask");
    }
  };

  return (
    <div>
      <Head>
        <title>Ether Lottery</title>
        <meta name="description" content="Etherium lotterry dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <nav className="navBar mt-4 mb-4">
          <div className="container">
            <div className="navbar-brand">
              <h1 className="title">Ether Lottery</h1>
            </div>
            <div className="navbar-end">
              <button
                onClick={connectWalletHandler}
                className="button is-medium is-primary is-responsive"
              >
                Connect Wallet !!
              </button>
            </div>
          </div>
        </nav>
        <div className="continer ml-6 mr-6">
          <section className="mt-5">
            <div className="columns">
              <div className="column is-two-third">
                <section className="mt-5">
                  <p>
                    <b>Enter</b> the lottery by sending <b>0.01 Ether</b>.
                  </p>
                  <button
                    onClick={enterLotteryHandler}
                    className="button is-link is-large is-light mt-3"
                  >
                    <b> Pay Now </b>
                  </button>
                </section>
                <section className="mt-6">
                  <p>
                    <b>Only Admin</b> can pick the winner.
                  </p>
                  <button
                    onClick={pickWinnerHandler}
                    className="button is-primary is-large is-light mt-3"
                  >
                    <b> Pick a winner</b>
                  </button>
                </section>
                <section className="mt-6">
                  <p>
                    <b>Only Admin</b> can pay the winner.
                  </p>
                  <button
                    onClick={payWinnerHandler}
                    className="button is-success is-large is-light mt-3"
                  >
                    <b> Pay to winner</b>
                  </button>
                </section>
                <section>
                  <div className="container has-text-danger mt-6 is-fluid">
                    <p>{error}</p>
                  </div>
                </section>
                <section>
                  <div className="container has-text-success mt-6">
                    <p>{successMsg}</p>
                  </div>
                </section>
              </div>
              <div className={`${styles.lottryInfo} column is-one-third`}>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Lottery History</h2>
                        {lotteryHistory &&
                          lotteryHistory.length > 0 &&
                          lotteryHistory.map((item) => {
                            if (lotteryId != item.id) {
                              return (
                                <div
                                  className="history-entry mt-3"
                                  key={item.id}
                                >
                                  <div>Lottery #{item.id} winner:</div>
                                  <div>
                                    <a
                                      href={`https://etherscan.io/address/${item.address}`}
                                      target="blank"
                                    >
                                      {item.address}
                                    </a>
                                  </div>
                                </div>
                              );
                            }
                          })}
                      </div>
                    </div>
                  </div>
                </section>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Players ({lotteryplayers.length})</h2>
                        <ul className="ml-0 none">
                          {lotteryplayers &&
                            lotteryplayers.length > 0 &&
                            lotteryplayers.map((player, index) => {
                              return (
                                <li key={`${player}-${index}`}>
                                  <a
                                    href={`https://etherscan.io/address/${player}`}
                                    target="blank"
                                  >
                                    {player}
                                  </a>
                                  ;
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Current Pot Amount</h2>
                        <p>{lotteryPot} Ether</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className="content has-text-centered">
          <p>
            &copy;<strong>Dragonstorm</strong>{" "}
            <a href="https://github.com/Dragonstormm" target="blank">
              Github
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
