var PHICrowdsale = artifacts.require("./PHICrowdsale.sol");
//import assertRevert from './helpers/assertRevert';


contract('PHICrowdsale', (accounts) => {
    var contract;
    //var owner = "0x6a108Cf23b06b5349893ECDE2203c7cE6dc745E0";
    var owner = accounts[0]; // for test

    var rate = Number(600);
    var buyWei = Number(1 * 10**18);
    var rateNew = Number(600);
    var buyWeiNew = 5 * 10**17;
    var buyWeiMin = 2 * 10**15;
    var buyWeiLimitWeekZero = Number(8 * 10**18);
    var buyWeiLimitWeekOther = Number(12 * 10**18);

    var fundForSale = 60250 * 10**21;

    it('should deployed contract', async ()  => {
        assert.equal(undefined, contract);
        contract = await PHICrowdsale.deployed();
        assert.notEqual(undefined, contract);
    });

    it('get address contract', async ()  => {
        assert.notEqual(undefined, contract.address);
    });

    it('verification balance owner contract', async ()  => {
        var balanceOwner = await contract.balanceOf(owner);
        assert.equal(fundForSale, balanceOwner);
    });


    it('verification of receiving Ether', async ()  => {
        var tokenAllocatedBefore = await contract.tokenAllocated.call();
        var balanceAccountTwoBefore = await contract.balanceOf(accounts[2]);
        var weiRaisedBefore = await contract.weiRaised.call();

        await contract.buyTokens(accounts[2],{from:accounts[2], value:buyWei});
        var tokenAllocatedAfter = await contract.tokenAllocated.call();
        assert.isTrue(tokenAllocatedBefore < tokenAllocatedAfter);
        assert.equal(0, tokenAllocatedBefore);
        //assert.equal(Number(rate*buyWei), Number(tokenAllocatedAfter));

       var balanceAccountTwoAfter = await contract.balanceOf(accounts[2]);
        assert.isTrue(balanceAccountTwoBefore < balanceAccountTwoAfter);
        assert.equal(0, balanceAccountTwoBefore);
        assert.equal(rate*buyWei, balanceAccountTwoAfter);

        var weiRaisedAfter = await contract.weiRaised.call();
        assert.isTrue(weiRaisedBefore < weiRaisedAfter);
        assert.equal(0, weiRaisedBefore);
        assert.equal(buyWei, weiRaisedAfter);

        var depositedAfter = await contract.getDeposited.call(accounts[2]);
        assert.equal(buyWei, depositedAfter);

        var balanceAccountThreeBefore = await contract.balanceOf(accounts[3]);
        await contract.buyTokens(accounts[3],{from:accounts[3], value:buyWeiNew});
        var balanceAccountThreeAfter = await contract.balanceOf(accounts[3]);
        assert.isTrue(balanceAccountThreeBefore < balanceAccountThreeAfter);
        assert.equal(0, balanceAccountThreeBefore);
        assert.equal(rateNew*buyWeiNew, balanceAccountThreeAfter);

    });

    it('verification tokens for referal bonus', async ()  => {
        var balanceAccountForBefore = await contract.balanceOf(accounts[4]);
        var balanceAccountFiveBefore = await contract.balanceOf(accounts[5]);
        await contract.buyTokens(accounts[4],{from:accounts[4], value:buyWeiNew, data:accounts[5]});
        var balanceAccountForAfter = await contract.balanceOf(accounts[4]);
        var balanceAccountFiveAfter = await contract.balanceOf(accounts[5]);
        var ccc = await contract.makeReferalBonus.call(rateNew*buyWeiNew, {from:accounts[4], data:accounts[5]});
        //console.log("balanceAccountFiveAfter = " + ccc)
    });


    it('verification define period', async ()  => {
        var currentDate = 1528128000; // Mon, 04 Jun 2018 16:00:00 GMT
        period = await contract.getPeriod(currentDate);
        assert.equal(0, period);

        currentDate = 1538438400; // Tue, 02 Oct 2018 00:00:00 GMT
        period = await contract.getPeriod(currentDate);
        assert.equal(1, period);

        currentDate = 1540051200; // Sat, 20 Oct 2018 16:00:00 GMT
        period = await contract.getPeriod(currentDate);
        assert.equal(0, period);

        currentDate = 1541433600; // Mon, 05 Nov 2018 16:00:00 GMT
        period = await contract.getPeriod(currentDate);
        assert.equal(2, period);

        currentDate = 1543708800; // Sun, 02 Dec 2018 00:00:00 GMT
        period = await contract.getPeriod(currentDate);
        assert.equal(0, period);
    });

    it('verification tokens limit min amount', async ()  => {
        var numberTokensMinWey = await contract.validPurchaseTokens.call(buyWeiMin);
        assert.equal(0, Number(numberTokensMinWey));
    });

});



