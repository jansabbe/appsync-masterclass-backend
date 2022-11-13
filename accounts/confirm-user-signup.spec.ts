import { faker } from "@faker-js/faker";
import { handler } from "./confirm-user-signup";
import { aPostConfirmSignUpEvent, getAccount } from "@common/test-utils";

it("saves accounts in database after signup", async () => {
  const id = faker.datatype.uuid();
  const username = faker.internet.userName();

  await handler(aPostConfirmSignUpEvent({ id, username }));

  await expect(getAccount(id)).resolves.toEqual({
    pk: id,
    username: username,
    acct: username,
    createdAt: expect.any(String),
    followersCount: 0,
    followingCount: 0,
    statusesCount: 0,
  });
});

it("replaces weird characters in the username with underscore", async () => {
  const id = faker.datatype.uuid();
  const actualUsername = "Josh Bobby ;$+@";
  const expectedUsername = "Josh_Bobby_";

  await handler(aPostConfirmSignUpEvent({ id, username: actualUsername }));

  await expect(getAccount(id)).resolves.toEqual({
    pk: id,
    username: expectedUsername,
    acct: expectedUsername,
    createdAt: expect.any(String),
    followersCount: 0,
    followingCount: 0,
    statusesCount: 0,
  });
});
