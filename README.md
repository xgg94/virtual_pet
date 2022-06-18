Final Project
================

### Deadline: Thu, 16 June 2022, 23:55

Topic
---------
Choose a topic to your liking for your own project. If you have no preference for any topic, you may build on the TU
Wien Beer Bar by either replacing parts and/or extending the existing project. For example, this could be a pub quiz, an
extended beer supply or an extended voting board.

Grading
---------
We consider the following aspects:

- Documentation: Provide the documentation of your project by completing the project details in the README.md on git.
  Add further files as necessary.
- Complexity: The project should be non-trivial. Rather, it should make use of mappings, roles with RBAC, modifiers,
  Ether and tokens when reasonable. Moreover, it should provide a simple web interface for interaction with the
  contract.
- Correctness: The project should use correct math (big numbers, overflow), include test cases and ensure that neither
  any ether nor any tokens are lost.
- Security: Try to avoid that the contract can be depleted by any method used in the challenges.
- Originality: We would like your projects to be distinguishable from reproductions, clones, forgeries, or derivative
  works. On a side note: we've already seen too many casinos.

We place less value on a fancy WebUI, as it is not part of the LVA.

**Your project is complex enough if 40 hours of effort are understandable for us.**

Project Outline 
---------------
### Deadline: Thu, 12 May 2022, 23:55.
Prepare and submit an outline for your chosen topic on TUWEL.
This should be a structured document (2 pages) that contains the following elements:

```
Title:
Short description of functionality:
Off-chain part - frontend design:
On-chain part - planned contracts:
Token concept incl. used standards:
Ether usage:
Roles:
Data structures:
Security considerations:
Used coding patterns in addition to roles (randomness, commitments, timeouts, deposits, or others):
```

Regarding the complexity of your project, please consider as a typical breakdown for your efforts:
- 15h Contract development  
- 5h Contract test cases
- 5h Frontend development  
- 5h Testing and deploying
- 10h Setup of GitLab, Truffle, etc.

Submission and Presentation
---------
Submit your project to your `master` branch on `git.sc.logic.at` and present it in the online review session on Thu, 23
June 2022. Reserve a time slot via TUWEL.

---------------------------

HOWTO
=====
Run `npm install` to install all dependencies.

This repository contains an initialized Truffle project.

Recommended web3.js version: v1.7.1

Truffle
-------
Implement your contracts in the `contracts/` folder. You can compile them with `npm run compile`

Implement your test cases in the `tests/` folder. You can run them with `npm run test`.

With `npm run dev` you can start a local truffle development chain.

You can deploy the project to the LVA-Chain via `npm run truffle deploy -- --network=prod` (requires running `geth`
client). If you use roles, please make us - the person at `addresses.getPublic(94)` - an owner/admin of the contract.

Web interface
-------------
You are free to implement your web interface to your liking. You can use static JavaScript files (similar to the BeerBar
Plain Version) or [Drizzle-React](https://github.com/trufflesuite/drizzle-react) (BeerBar React Version), or any other
suitable framework like [Angular](https://angular.io/)
, [Vue](https://vuejs.org/), [React](https://reactjs.org/).

If you use only static content, put your files into the `public/` folder.  
You can run a local webserver with `npm run start`.

If you use another framework, you will need to adjust the `build` command in `package.json`. Follow the documentation of
your framework for doing so.

The content of your `public/` folder will also be available via the URL <https://final.pages.sc.logic.at/e01604873>
.

---------------------------

Project details
===============
(Please do not change the headers or layout of this section)

Title
-----
Digital Pet Game

Addresses
---------
TODO - Write here on which addresses you have deployed the contracts on the LVA-Chain:
LVA - ATM owner: 0x8913AB7bfa69159A4D40Ea9B0F231647d53aEa9F

PetToken: 0x9D6eC53334E2AC57f854e187EB5e61DFbC6D9C47
PetFactory: 0x8913AB7bfa69159A4D40Ea9B0F231647d53aEa9F
ATM: 0x283099018ff7f149718f081a351fB6De9870F815

Contract1: 0x...      
Contract2: 0x...

Description
-----------
The goal of this project was to create a digital pet that can be interacted with. 
The digital currency "Petcoin" can be purchased, with which animals can be bought and interactions with them can be carried out. 
Three different animals can be distinguished: Rat, Dog, Sheep.
A new contract is created for each pet; if the animal dies, the contract becomes virtually unusable. 
Interactions that have to be paid for are feeding and adding damage. 
The action "PLAY" is free of charge, but a pseudo-random generator adds or subtracts life from the animal. The level of an animal cannot be influenced. Pets can be sold to other users. The selling price can be set freely. 
When exchange requests are received, the seller's pets can be inspected.
Of course, unused Petcoins can be converted back to Ether


Usage
-----
First you need to specify your own address. After that, Petcoins can be purchased at the top left. Under "buy coins" the amount in Ether can be specified. Just below that, Petcoins can be converted back into Ether. 
After that, a new pet can be bought or a pet can be purchased via an incoming sale request.   
Afterwards, one can display one's pets, interact with them or offer one for sale oneself. 
In the lower area any pets can be displayed.
To change the PORT in frontend you need to change it for drizzle in "App.js"

Implementation
--------------
Basically, the implementation is divided into a PetToken, ATM and VirtualPet contract. PetToken is an IERC20 token implementation. ATM manages all users and acts as a central point of contact for users. The VirtualPet contract is an abstract contract that defines basic functions and leaves others free for implementation by children. 
In this case, these do not differ from each other, although individual variables can be easily changed to, for example, level at different rates or heal health at different rates.
The other contracts are there to store different data, to use factories or to serve as an interface. 

Effort breakdown
------------------
30h - contract including bug fixing
10h - Testing during implementation via Remix and Truffle.
20h - Setup of GitLab, Truffle, Drizzle, etc.
8h - front end

Difficulties
------------
The first problem was the division of contracts. Since I absolutely wanted a separate contract for each individual pet, there were difficulties with the size of the contract in the meantime. Furthermore, working with Drizzle was a challenge, since I had no experience with it. 
Closing security gaps was also a difficult thing. 

Proposal for future changes
---------------------------
I think the task was very interesting! I was able to learn a lot. What I missed a bit was the feeling of how big the project should really be. 
