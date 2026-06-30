import { Test, TestingModule } from '@nestjs/testing';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

// The interesting logic here is the server-side anti-abuse capping: a client
// can ask for any `limit`, but the controller must clamp it so nobody can dump
// the whole leaderboard (or a player's full history) in one request. The
// `DefaultValuePipe`/`ParseIntPipe` are applied by Nest itself, so by the time
// the method runs `limit` is already an integer -- what we own and must test is
// the `Math.min(...)` clamp.
describe('SessionsController', () => {
  let controller: SessionsController;

  const serviceMock = {
    getLeaderboard: jest.fn(),
    getByPlayer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [{ provide: SessionsService, useValue: serviceMock }],
    }).compile();

    controller = module.get<SessionsController>(SessionsController);
    jest.clearAllMocks();
  });

  it('truncates the leaderboard to the top 100 when more is requested', () => {
    controller.getLeaderboard(500);
    expect(serviceMock.getLeaderboard).toHaveBeenCalledWith(100);
  });

  it('keeps a smaller leaderboard limit untouched', () => {
    controller.getLeaderboard(25);
    expect(serviceMock.getLeaderboard).toHaveBeenCalledWith(25);
  });

  it('caps a player history request at 20 entries', () => {
    const playerId = 'player-uuid-1111';
    controller.getByPlayer(playerId, 50);
    expect(serviceMock.getByPlayer).toHaveBeenCalledWith(playerId, 20);
  });

  it('keeps a smaller player history limit untouched', () => {
    const playerId = 'player-uuid-1111';
    controller.getByPlayer(playerId, 10);
    expect(serviceMock.getByPlayer).toHaveBeenCalledWith(playerId, 10);
  });
});
